"use client";

const GOAL = 500;

const MILESTONES = [
  { count: 100, label: "100", emoji: "🌱" },
  { count: 250, label: "250", emoji: "🌿" },
  { count: 500, label: "500", emoji: "🌳" },
];

type Props = {
  currentCount: number;
};

export function DomainChallenge({ currentCount }: Props) {
  const pct = Math.min((currentCount / GOAL) * 100, 100);
  const reached = currentCount >= GOAL;

  return (
    <section className="animate-fade-up flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-archive">
          🏠 도메인 챌린지
        </span>
        <span className="text-xs tabular-nums text-stone">
          {currentCount.toLocaleString()} / {GOAL.toLocaleString()}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-stone">
        {reached
          ? "🎉 목표 달성! 정식 도메인을 준비합니다."
          : "문장이 500개 모이면 글적의 정식 도메인이 열립니다."}
      </p>

      {/* 프로그레스 바 */}
      <div className="relative h-3 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-archive transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />

        {/* 마일스톤 마커 */}
        {MILESTONES.map((m) => {
          const pos = (m.count / GOAL) * 100;
          const passed = currentCount >= m.count;
          return (
            <div
              key={m.count}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            >
              <div
                className={`h-2 w-2 rounded-full border ${
                  passed
                    ? "border-archive bg-archive"
                    : "border-stone-faint bg-surface"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* 마일스톤 라벨 */}
      <div className="relative h-4">
        {MILESTONES.map((m) => {
          const pos = (m.count / GOAL) * 100;
          const passed = currentCount >= m.count;
          return (
            <span
              key={m.count}
              className={`absolute -translate-x-1/2 text-[10px] tabular-nums ${
                passed ? "text-archive" : "text-stone-faint"
              }`}
              style={{ left: `${pos}%` }}
            >
              {m.emoji} {m.label}
            </span>
          );
        })}
      </div>

      {!reached ? (
        <p className="text-center text-[10px] text-stone-faint">
          {GOAL - currentCount}개 더 모으면 달성!
        </p>
      ) : null}
    </section>
  );
}
