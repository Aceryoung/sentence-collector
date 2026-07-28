const MS_PER_DAY = 86_400_000;

export function pickDailyIndex(length: number, date: Date): number | null {
  if (length <= 0) return null;
  const dayKey = Math.floor(date.getTime() / MS_PER_DAY);
  return dayKey % length;
}

export function pickDailyId(ids: string[], date: Date): string | null {
  const index = pickDailyIndex(ids.length, date);
  return index === null ? null : ids[index];
}
