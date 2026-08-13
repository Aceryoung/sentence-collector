import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserStreak } from "@/lib/streak";
import { BrandMascot } from "@/components/BrandMascot";
import { ActivityHeatmap } from "./ActivityHeatmap";

export default async function JourneyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 통계 집계: 총 문장, 총 좋아요, 스트릭
  const now = new Date();
  const [
    { count: sentenceCount },
    { count: reflectionCount },
    userStreak,
    { data: practiceRows },
    { data: sentenceRows },
  ] = await Promise.all([
    supabase
      .from("sentences")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("reflections")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id),
    getUserStreak(supabase, user.id, now),
    // 최근 90일 필사 기록
    supabase
      .from("practice_logs")
      .select("date")
      .eq("user_id", user.id)
      .gte(
        "date",
        new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          .toISOString()
          .slice(0, 10),
      ),
    // 최근 90일 문장 등록일
    supabase
      .from("sentences")
      .select("created_at")
      .eq("author_id", user.id)
      .is("deleted_at", null)
      .gte(
        "created_at",
        new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString(),
      ),
  ]);

  // 히트맵 데이터: 날짜별 활동 횟수
  const activityMap: Record<string, number> = {};
  for (const row of practiceRows ?? []) {
    const d = row.date as string;
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }
  for (const row of sentenceRows ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }

  // 최근 필사 기록 (타이핑 정보 포함)
  const { data: typingHistory } = await supabase
    .from("practice_logs")
    .select("date, accuracy, duration_seconds, sentences(body)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(10);

  // 총 좋아요 (내 문장에 달린)
  const { data: likeData } = await supabase
    .from("sentences")
    .select("likes(count)")
    .eq("author_id", user.id)
    .is("deleted_at", null);

  const totalLikes = (likeData ?? []).reduce(
    (sum, row) => {
      const likes = row.likes as { count: number }[] | null;
      return sum + (likes?.[0]?.count ?? 0);
    },
    0,
  );

  // 마스코트 피드백 메시지 — 성취에 따라 다르게
  const sc = sentenceCount ?? 0;
  const mascotMessage =
    sc >= 50
      ? "대단해요! 당신만의 문장 서재가 채워지고 있어요."
      : sc >= 10
        ? "꾸준히 모으고 있네요. 멋진 아카이브가 되어가고 있어요."
        : sc >= 1
          ? "첫 발걸음을 내딛었어요. 한 문장 한 문장이 소중한 기록이에요."
          : "아직 수집한 문장이 없어요. 첫 문장을 등록해볼까요?";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-ink">나의 여정</h1>
        {userStreak.streak > 0 ? (
          <span className="rounded-[var(--radius-pill)] bg-coral-soft px-2.5 py-0.5 text-xs font-bold text-coral">
            🔥 {userStreak.streak}일 연속
          </span>
        ) : null}
      </div>

      {/* 마스코트 피드백 카드 */}
      <section className="flex items-center gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <BrandMascot className="h-14 w-[41px] shrink-0 text-archive" />
        <p className="text-sm leading-relaxed text-ink">{mascotMessage}</p>
      </section>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="수집한 문장" value={sc} highlight={sc >= 10} />
        <StatCard label="받은 좋아요" value={totalLikes} highlight={totalLikes >= 5} />
        <StatCard label="남긴 감상" value={reflectionCount ?? 0} />
        <StatCard label="최장 스트릭" value={`${userStreak.streak}일`} highlight={userStreak.streak >= 7} />
      </div>

      {/* 활동 히트맵 */}
      <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone">
          최근 90일 활동
        </h2>
        <ActivityHeatmap data={activityMap} />
      </section>

      {/* 필사 기록 */}
      {typingHistory && typingHistory.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone">
            📝 필사 기록
          </h2>
          <ul className="flex flex-col gap-2">
            {typingHistory.map((log, i) => {
              const sentence = Array.isArray(log.sentences)
                ? log.sentences[0]
                : log.sentences;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="line-clamp-1 text-sm text-ink">
                      {(sentence as { body: string } | null)?.body ?? "삭제된 문장"}
                    </p>
                    <span className="text-xs text-stone-faint">{log.date}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-stone">
                    {log.accuracy != null ? (
                      <span className={log.accuracy >= 0.95 ? "font-bold text-coral" : ""}>
                        {Math.round(log.accuracy * 100)}%
                      </span>
                    ) : (
                      <span className="text-stone-faint">완료</span>
                    )}
                    {log.duration_seconds != null && log.duration_seconds > 0 ? (
                      <span>{formatJourneyDuration(log.duration_seconds)}</span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* 성취 배지 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone">
          성취
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge
            emoji="📝"
            title="첫 문장"
            unlocked={sc >= 1}
          />
          <Badge
            emoji="📚"
            title="10문장 수집"
            unlocked={sc >= 10}
          />
          <Badge
            emoji="🔥"
            title="3일 연속 필사"
            unlocked={userStreak.streak >= 3}
          />
          <Badge
            emoji="⭐"
            title="7일 연속 필사"
            unlocked={userStreak.streak >= 7}
          />
          <Badge
            emoji="❤️"
            title="첫 좋아요"
            unlocked={totalLikes >= 1}
          />
          <Badge
            emoji="💬"
            title="첫 감상"
            unlocked={(reflectionCount ?? 0) >= 1}
          />
        </div>
      </section>

      <Link
        href="/my"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 내 보관함으로
      </Link>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3.5 shadow-[var(--shadow-card)]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone">
        {label}
      </span>
      <span
        className={`font-serif text-2xl font-bold ${highlight ? "text-coral" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatJourneyDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}

function Badge({
  emoji,
  title,
  unlocked,
}: {
  emoji: string;
  title: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[var(--radius-card)] border px-3 py-2.5 text-sm transition-all ${
        unlocked
          ? "border-coral/25 bg-coral-soft text-ink shadow-[var(--shadow-card)]"
          : "border-hairline text-stone-faint opacity-40 grayscale"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className={unlocked ? "font-bold" : ""}>{title}</span>
    </div>
  );
}
