import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandMascot } from "@/components/BrandMascot";
import { JoinButton } from "./JoinButton";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, title, description, duration_days, starts_at, ends_at")
    .eq("id", id)
    .single();

  if (!challenge) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: participantCount } = await supabase
    .from("challenge_participants")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", id);

  // 현재 사용자가 참여 중인지 확인
  let myProgress: number | null = null;
  if (user) {
    const { data: participation } = await supabase
      .from("challenge_participants")
      .select("progress")
      .eq("challenge_id", id)
      .eq("user_id", user.id)
      .single();
    myProgress = participation?.progress ?? null;
  }

  const isActive = new Date(challenge.ends_at) > new Date();
  const hasJoined = myProgress !== null;
  const progressPercent = hasJoined
    ? Math.min(100, Math.round((myProgress! / challenge.duration_days) * 100))
    : 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMascot className="h-16 w-[47px] text-archive" />
        <h1 className="font-serif text-2xl font-bold text-ink">
          {challenge.title}
        </h1>
        {challenge.description ? (
          <p className="max-w-md leading-relaxed text-stone">
            {challenge.description}
          </p>
        ) : null}
      </div>

      {/* 챌린지 정보 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-3">
          <span className="font-serif text-lg font-bold text-ink">
            {challenge.duration_days}
          </span>
          <span className="text-xs text-stone">일간</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-3">
          <span className="font-serif text-lg font-bold text-ink">
            {participantCount ?? 0}
          </span>
          <span className="text-xs text-stone">참여자</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-hairline bg-surface px-3 py-3">
          <span className="font-serif text-lg font-bold text-ink">
            {isActive ? "진행 중" : "종료"}
          </span>
          <span className="text-xs text-stone">상태</span>
        </div>
      </div>

      {/* 진행률 / 참여 */}
      {hasJoined ? (
        <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline-strong bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-stone">
              내 진행률
            </span>
            <span className="text-xs text-archive">
              {myProgress}/{challenge.duration_days}일
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-archive transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent >= 100 ? (
            <p className="text-center text-sm text-archive">
              챌린지를 완료했어요!
            </p>
          ) : null}
        </section>
      ) : isActive ? (
        user ? (
          <JoinButton challengeId={id} />
        ) : (
          <Link
            href="/login"
            className="self-center rounded-[var(--radius-pill)] bg-archive px-6 py-2.5 text-sm text-archive-contrast"
          >
            로그인하고 참여하기
          </Link>
        )
      ) : (
        <p className="text-center text-sm text-stone">
          이 챌린지는 종료되었어요.
        </p>
      )}

      <Link
        href="/challenges"
        className="self-start text-xs text-stone underline underline-offset-4 hover:text-ink"
      >
        ← 챌린지 목록으로
      </Link>
    </main>
  );
}
