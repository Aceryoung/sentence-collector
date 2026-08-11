"use client";

/**
 * 최근 90일 활동 히트맵.
 * GitHub 스타일 격자로 날짜별 활동량을 시각화한다.
 */
export function ActivityHeatmap({ data }: { data: Record<string, number> }) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: data[key] ?? 0 });
  }

  // 13주 × 7일 격자. 가장 오래된 날의 요일부터 시작.
  const firstDow = new Date(days[0].date).getDay(); // 0=일, 6=토
  type DayCell = { date: string; count: number } | null;
  const padding: DayCell[] = Array.from({ length: firstDow }, () => null);
  const padded: DayCell[] = [...padding, ...days];
  const weeks: DayCell[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}: ${day.count}건` : ""}
                className={`h-3 w-3 rounded-sm ${
                  !day
                    ? "bg-transparent"
                    : day.count === 0
                      ? "bg-hairline"
                      : day.count === 1
                        ? "bg-archive/30"
                        : day.count <= 3
                          ? "bg-archive/60"
                          : "bg-archive"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-stone-faint">
        <span>적음</span>
        <div className="flex gap-[2px]">
          <div className="h-3 w-3 rounded-sm bg-hairline" />
          <div className="h-3 w-3 rounded-sm bg-archive/30" />
          <div className="h-3 w-3 rounded-sm bg-archive/60" />
          <div className="h-3 w-3 rounded-sm bg-archive" />
        </div>
        <span>많음</span>
      </div>
    </div>
  );
}
