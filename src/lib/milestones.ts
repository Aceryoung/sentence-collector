/** 스트릭 마일스톤 정의 */
export type Milestone = {
  days: number;
  title: string;
  message: string;
};

const MILESTONES: Milestone[] = [
  { days: 3, title: "새싹 필사인", message: "3일 연속 필사! 좋은 습관이 시작되고 있어요." },
  { days: 7, title: "일주일 완주", message: "7일 연속 필사! 꾸준함이 빛나고 있어요." },
  { days: 14, title: "2주 달성", message: "14일 연속 필사! 이미 습관이 되어가고 있어요." },
  { days: 30, title: "한 달 마스터", message: "30일 연속 필사! 대단한 끈기예요." },
  { days: 50, title: "50일 달성", message: "50일 연속 필사! 진정한 필사인이에요." },
  { days: 100, title: "백일 전설", message: "100일 연속 필사! 전설적인 기록이에요." },
];

/**
 * 현재 스트릭에 해당하는 마일스톤을 반환한다.
 * 정확히 마일스톤 일수와 일치할 때만 반환 (달성 순간만 축하).
 */
export function getExactMilestone(streak: number): Milestone | null {
  return MILESTONES.find((m) => m.days === streak) ?? null;
}

/**
 * 현재 스트릭 이하의 가장 높은 마일스톤을 반환한다 (뱃지 표시용).
 */
export function getCurrentBadge(streak: number): Milestone | null {
  let badge: Milestone | null = null;
  for (const m of MILESTONES) {
    if (streak >= m.days) badge = m;
  }
  return badge;
}

/**
 * 다음 마일스톤까지 남은 일수를 반환한다.
 */
export function getNextMilestone(streak: number): { milestone: Milestone; remaining: number } | null {
  const next = MILESTONES.find((m) => m.days > streak);
  if (!next) return null;
  return { milestone: next, remaining: next.days - streak };
}
