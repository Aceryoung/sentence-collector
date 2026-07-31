import type { createClient } from "@/lib/supabase/server";
import { getPeriodStart, rankBySentenceLikes } from "./ranking";
import type { SentenceCardData } from "./sentences";
import { SENTENCE_WITH_LIKE_COUNT_SELECT, toSentenceCardData } from "./sentences";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type RecapInput = {
  mySentenceCreatedAt: Map<string, string>;
  likesInPeriod: { sentenceId: string }[];
  periodStart: Date;
};

export type RecapResult = {
  sentenceCountThisPeriod: number;
  totalLikes: number;
  topSentenceId: string | null;
};

export function computeRecap(input: RecapInput): RecapResult {
  const { mySentenceCreatedAt, likesInPeriod, periodStart } = input;
  const periodStartIso = periodStart.toISOString();

  const sentenceCountThisPeriod = [...mySentenceCreatedAt.values()].filter(
    (createdAt) => createdAt >= periodStartIso,
  ).length;

  const [topRanked] = rankBySentenceLikes(likesInPeriod, mySentenceCreatedAt, 1);

  return {
    sentenceCountThisPeriod,
    totalLikes: likesInPeriod.length,
    topSentenceId: topRanked?.sentenceId ?? null,
  };
}

export type MonthlyRecap = RecapResult & {
  topSentence: SentenceCardData | null;
};

export async function getMonthlyRecap(
  supabase: SupabaseServerClient,
  userId: string,
  now: Date = new Date(),
): Promise<MonthlyRecap> {
  const periodStart = getPeriodStart("month", now);

  const { data: mySentenceRows } = await supabase
    .from("sentences")
    .select("id, created_at")
    .eq("author_id", userId)
    .is("deleted_at", null);

  const mySentenceCreatedAt = new Map(
    (mySentenceRows ?? []).map((row) => [
      row.id as string,
      row.created_at as string,
    ]),
  );
  const mySentenceIds = [...mySentenceCreatedAt.keys()];

  const { data: likeRows } =
    mySentenceIds.length > 0
      ? await supabase
          .from("likes")
          .select("sentence_id")
          .in("sentence_id", mySentenceIds)
          .gte("created_at", periodStart.toISOString())
      : { data: [] };

  const likesInPeriod = (likeRows ?? []).map((row) => ({
    sentenceId: row.sentence_id as string,
  }));

  const result = computeRecap({ mySentenceCreatedAt, likesInPeriod, periodStart });

  let topSentence: SentenceCardData | null = null;
  if (result.topSentenceId) {
    const { data } = await supabase
      .from("sentences")
      .select(SENTENCE_WITH_LIKE_COUNT_SELECT)
      .eq("id", result.topSentenceId)
      .single();
    topSentence = data ? toSentenceCardData(data) : null;
  }

  return { ...result, topSentence };
}
