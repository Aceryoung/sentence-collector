import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/leaderboard";

type Props = {
  entries: LeaderboardEntry[];
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function PracticeLeaderboard({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <section className="animate-fade-up flex flex-col gap-3" style={{ animationDelay: "150ms" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-archive">
          필사 챌린지 순위
        </span>
        <Link
          href="/challenges"
          className="text-[10px] text-stone underline underline-offset-4 hover:text-ink"
        >
          전체 보기
        </Link>
      </div>

      <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-surface shadow-[var(--shadow-card)]">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 px-4 py-3 ${
              entry.isCurrentUser
                ? "bg-coral-soft"
                : "border-b border-hairline last:border-b-0"
            }`}
          >
            {/* 순위 */}
            <span className="w-6 shrink-0 text-center text-sm">
              {entry.rank <= 3 ? RANK_MEDALS[entry.rank - 1] : (
                <span className="tabular-nums text-stone-faint">{entry.rank}</span>
              )}
            </span>

            {/* 이름 */}
            <span
              className={`flex-1 truncate text-sm ${
                entry.isCurrentUser ? "font-bold text-ink" : "text-ink"
              }`}
            >
              {entry.displayName}
            </span>

            {/* 필사 횟수 */}
            <span className="shrink-0 tabular-nums text-xs text-stone">
              {entry.practiceCount}일
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
