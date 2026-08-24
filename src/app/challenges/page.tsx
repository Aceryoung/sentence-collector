import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserStreak } from "@/lib/streak";
import { BrandMascot } from "@/components/BrandMascot";
import { EmptyState } from "@/components/EmptyState";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = new Date();

  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, description, duration_days, starts_at, ends_at, challenge_participants(count)")
    .order("starts_at", { ascending: false })
    .limit(20);

  const nowIso = now.toISOString();
  const active = (challenges ?? []).filter((c) => c.ends_at > nowIso);
  const past = (challenges ?? []).filter((c) => c.ends_at <= nowIso);

  // 개인 필사 현황
  let userStreak = { streak: 0, completedToday: false };
  let totalPractice = 0;
  if (user) {
    userStreak = await getUserStreak(supabase, user.id, now);
    const { count } = await supabase
      .from("practice_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    totalPractice = count ?? 0;
  }

  const goal = 30;
  const progressPercent = Math.min(100, Math.round((totalPractice / goal) * 100));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BrandMascot className="h-10 w-[30px] text-archive" />
        <h1 className="font-serif text-xl font-bold text-ink">필사 챌린지</h1>
      </div>

      {/* 개인 필사 현황 */}
      {user ? (
        <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-hairline-strong bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-sm font-bold text-ink">
              나의 필사 현황
            </h2>
            <Link
              href="/my/journey"
              className="text-xs text-stone underline underline-offset-4 hover:text-ink"
            >
              상세 보기 →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl font-bold text-ink">
                {userStreak.streak}
              </span>
              <span className="text-[10px] text-stone">연속 일수</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl font-bold text-ink">
                {totalPractice}
              </span>
              <span className="text-[10px] text-stone">총 필사</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className={`font-serif text-2xl font-bold ${userStreak.completedToday ? "text-coral" : "text-stone-faint"}`}>
                {userStreak.completedToday ? "✓" : "—"}
              </span>
              <span className="text-[10px] text-stone">오늘</span>
            </div>
          </div>

          {/* 30일 목표 프로그레스 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-stone">
              <span>30일 목표</span>
              <span className="tabular-nums">{totalPractice}/{goal}일</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-hairline">
              <div
                className="ink-progress-bar h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {!userStreak.completedToday ? (
            <Link
              href="/practice"
              className="self-center rounded-[var(--radius-pill)] border-none bg-cta px-5 py-2.5 text-center text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
            >
              오늘의 필사 하러가기
            </Link>
          ) : (
            <p className="text-center text-sm text-archive">
              오늘의 필사를 완료했어요
            </p>
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
          <h2 className="font-serif text-sm font-bold text-ink">
            나의 필사 현황
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl font-bold text-stone-faint">—</span>
              <span className="text-[10px] text-stone">연속 일수</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl font-bold text-stone-faint">—</span>
              <span className="text-[10px] text-stone">총 필사</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl font-bold text-stone-faint">—</span>
              <span className="text-[10px] text-stone">오늘</span>
            </div>
          </div>
          <Link
            href="/login"
            className="self-center rounded-[var(--radius-pill)] border-none bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
          >
            로그인하고 시작하기
          </Link>
        </section>
      )}

      {/* 공식 챌린지 */}
      {active.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-sm font-bold text-ink">
            진행 중인 챌린지
          </h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {active.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
          </div>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-sm font-bold text-ink">
            완료된 챌린지
          </h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {past.map((c) => (
            <ChallengeCard key={c.id} challenge={c} ended />
          ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

type ChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  starts_at: string;
  ends_at: string;
  challenge_participants: { count: number }[] | null;
};

function ChallengeCard({
  challenge,
  ended = false,
}: {
  challenge: ChallengeRow;
  ended?: boolean;
}) {
  const participants =
    challenge.challenge_participants?.[0]?.count ?? 0;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`card-lift flex flex-col gap-2 rounded-[var(--radius-card)] border bg-surface px-5 py-4 shadow-[var(--shadow-card)] hover:border-archive/40 hover:shadow-[var(--shadow-card-hover)] ${
        ended ? "border-hairline opacity-70" : "border-hairline-strong"
      }`}
    >
      <h3 className="font-serif text-base font-bold text-ink">
        {challenge.title}
      </h3>
      {challenge.description ? (
        <p className="text-sm text-stone">{challenge.description}</p>
      ) : null}
      <div className="flex items-center gap-4 text-xs text-stone-faint">
        <span>{challenge.duration_days}일간</span>
        <span>{participants}명 참여</span>
        {ended ? <span className="text-archive">종료</span> : null}
      </div>
    </Link>
  );
}
