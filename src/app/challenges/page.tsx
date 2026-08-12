import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandMascot } from "@/components/BrandMascot";
import { EmptyState } from "@/components/EmptyState";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, description, duration_days, starts_at, ends_at, challenge_participants(count)")
    .order("starts_at", { ascending: false })
    .limit(20);

  const active = (challenges ?? []).filter((c) => c.ends_at > now);
  const past = (challenges ?? []).filter((c) => c.ends_at <= now);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <BrandMascot className="h-10 w-[30px] text-archive" />
        <h1 className="font-serif text-xl font-bold text-ink">필사 챌린지</h1>
      </div>

      {active.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-wide text-stone">
            진행 중
          </h2>
          {active.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </section>
      ) : (
        <EmptyState
          message="현재 진행 중인 챌린지가 없어요."
        />
      )}

      {past.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-wide text-stone">
            완료된 챌린지
          </h2>
          {past.map((c) => (
            <ChallengeCard key={c.id} challenge={c} ended />
          ))}
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
      className={`flex flex-col gap-2 rounded-[var(--radius-card)] border bg-surface px-5 py-4 shadow-[var(--shadow-card)] transition-colors hover:border-archive/40 ${
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
