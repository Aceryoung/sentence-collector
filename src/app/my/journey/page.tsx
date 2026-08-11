import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserStreak } from "@/lib/streak";
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
      .select("completed_date")
      .eq("user_id", user.id)
      .gte(
        "completed_date",
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
    const d = row.completed_date as string;
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }
  for (const row of sentenceRows ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  }

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

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-ink">나의 여정</h1>
        {userStreak.streak > 0 ? (
          <span className="rounded-[var(--radius-pill)] border border-archive px-2.5 py-0.5 text-xs text-archive">
            🔥 {userStreak.streak}일 연속
          </span>
        ) : null}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="수집한 문장" value={sentenceCount ?? 0} />
        <StatCard label="받은 좋아요" value={totalLikes} />
        <StatCard label="남긴 감상" value={reflectionCount ?? 0} />
        <StatCard label="최장 스트릭" value={`${userStreak.streak}일`} />
      </div>

      {/* 활동 히트맵 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-wide text-stone">
          최근 90일 활동
        </h2>
        <ActivityHeatmap data={activityMap} />
      </section>

      {/* 성취 배지 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-wide text-stone">
          성취
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge
            emoji="📝"
            title="첫 문장"
            unlocked={(sentenceCount ?? 0) >= 1}
          />
          <Badge
            emoji="📚"
            title="10문장 수집"
            unlocked={(sentenceCount ?? 0) >= 10}
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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
      <span className="text-xs text-stone">{label}</span>
      <span className="font-serif text-xl font-bold text-ink">{value}</span>
    </div>
  );
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
      className={`flex items-center gap-2 rounded-[var(--radius-card)] border px-3 py-2 text-sm ${
        unlocked
          ? "border-archive/30 bg-archive/5 text-ink"
          : "border-hairline text-stone-faint opacity-50"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span>{title}</span>
    </div>
  );
}
