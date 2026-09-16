"use client";

import { useEffect, useState } from "react";
import type { Milestone } from "@/lib/milestones";

type Props = {
  milestone: Milestone;
  nextInfo: { milestone: Milestone; remaining: number } | null;
};

export function MilestoneCelebration({ milestone, nextInfo }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 짧은 딜레이 후 등장 애니메이션
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center gap-4 transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-bold tracking-widest text-coral">
          마일스톤 달성!
        </span>
        <p className="font-serif text-lg font-bold text-ink">
          {milestone.title}
        </p>
        <p className="text-sm text-stone">
          {milestone.message}
        </p>
      </div>
      {nextInfo ? (
        <p className="text-xs text-stone-faint">
          다음 목표: {nextInfo.milestone.title}까지{" "}
          <span className="tabular-nums font-bold text-archive">
            {nextInfo.remaining}일
          </span>
        </p>
      ) : null}
    </div>
  );
}
