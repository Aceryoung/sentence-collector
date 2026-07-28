import type { createClient } from "@/lib/supabase/server";
import type { SentenceCardData } from "@/lib/sentences";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type Period = "day" | "week" | "month";

const PERIOD_MS: Record<Period, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

// 캘린더 경계(자정/월초) 대신 롤링 윈도우로 계산한다 — 타임존별 "오늘/이번주"
// 경계를 정할 필요가 없어 단순하다. (PLAN.md에 명시된 의도된 단순화)
export function getPeriodStart(period: Period, now: Date): Date {
  return new Date(now.getTime() - PERIOD_MS[period]);
}

export type RankedSentenceId = {
  sentenceId: string;
  likeCount: number;
};

export function rankBySentenceLikes(
  likes: { sentenceId: string }[],
  sentenceCreatedAt: Map<string, string>,
  limit: number,
): RankedSentenceId[] {
  const counts = new Map<string, number>();
  for (const like of likes) {
    counts.set(like.sentenceId, (counts.get(like.sentenceId) ?? 0) + 1);
  }

  const entries: RankedSentenceId[] = [...counts.entries()].map(
    ([sentenceId, likeCount]) => ({ sentenceId, likeCount }),
  );

  entries.sort((a, b) => {
    if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
    // 동점이면 문장이 더 최근에 등록된 쪽을 우선한다.
    const aTime = sentenceCreatedAt.get(a.sentenceId) ?? "";
    const bTime = sentenceCreatedAt.get(b.sentenceId) ?? "";
    return bTime.localeCompare(aTime);
  });

  return entries.slice(0, limit);
}

export async function getRanking(
  supabase: SupabaseServerClient,
  period: Period,
  limit: number,
): Promise<SentenceCardData[]> {
  const periodStart = getPeriodStart(period, new Date());

  const { data: likeRows } = await supabase
    .from("likes")
    .select("sentence_id")
    .gte("created_at", periodStart.toISOString());

  const likes = (likeRows ?? []).map((row) => ({
    sentenceId: row.sentence_id as string,
  }));

  if (likes.length === 0) return [];

  const distinctIds = [...new Set(likes.map((like) => like.sentenceId))];

  const { data: sentenceRows } = await supabase
    .from("sentences")
    .select("id, body, source, created_at")
    .in("id", distinctIds)
    .is("deleted_at", null);

  const sentenceCreatedAt = new Map(
    (sentenceRows ?? []).map((row) => [
      row.id as string,
      row.created_at as string,
    ]),
  );
  const sentenceById = new Map(
    (sentenceRows ?? []).map((row) => [
      row.id as string,
      { body: row.body as string, source: row.source as string | null },
    ]),
  );

  const ranked = rankBySentenceLikes(likes, sentenceCreatedAt, limit);

  return ranked
    .filter((entry) => sentenceById.has(entry.sentenceId))
    .map((entry) => {
      const sentence = sentenceById.get(entry.sentenceId)!;
      return {
        id: entry.sentenceId,
        body: sentence.body,
        source: sentence.source,
        likeCount: entry.likeCount,
      };
    });
}
