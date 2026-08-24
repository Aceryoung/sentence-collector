"use client";

import { ActivityHeatmap } from "./journey/ActivityHeatmap";

export type JourneyData = {
  sentenceCount: number;
  reflectionCount: number;
  totalLikes: number;
  streak: number;
  activityMap: Record<string, number>;
  typingHistory: {
    date: string;
    accuracy: number | null;
    duration_seconds: number | null;
    sentenceBody: string | null;
  }[];
};

export function MyJourney({ data }: { data: JourneyData }) {
  const { sentenceCount, reflectionCount, totalLikes, streak, activityMap, typingHistory } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* 2-col: stats sidebar + main on desktop */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

        {/* 왼쪽: 통계 + 성취 */}
        <div className="flex shrink-0 flex-col gap-5 lg:w-64">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="수집한 문장" value={sentenceCount} highlight={sentenceCount >= 10} />
            <StatCard label="받은 좋아요" value={totalLikes} highlight={totalLikes >= 5} />
            <StatCard label="남긴 감상" value={reflectionCount} />
            <StatCard label="최장 스트릭" value={`${streak}일`} highlight={streak >= 7} />
          </div>

          {/* 성취 배지 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-sm font-bold text-ink">성취</h2>
            <div className="flex flex-wrap gap-2">
              <Badge title="첫 문장" unlocked={sentenceCount >= 1} />
              <Badge title="10문장 수집" unlocked={sentenceCount >= 10} />
              <Badge title="3일 연속 필사" unlocked={streak >= 3} />
              <Badge title="7일 연속 필사" unlocked={streak >= 7} />
              <Badge title="첫 좋아요" unlocked={totalLikes >= 1} />
              <Badge title="첫 감상" unlocked={reflectionCount >= 1} />
            </div>
          </section>
        </div>

        {/* 오른쪽: 히트맵 + 필사 기록 */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* 활동 히트맵 */}
          <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-sm font-bold text-ink">최근 90일 활동</h2>
            <ActivityHeatmap data={activityMap} />
          </section>

          {/* 필사 기록 */}
          {typingHistory.length > 0 ? (
            <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
              <h2 className="font-serif text-sm font-bold text-ink">필사 기록</h2>
              <ul className="flex flex-col gap-2">
                {typingHistory.map((log, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="line-clamp-1 text-sm text-ink">
                        {log.sentenceBody ?? "삭제된 문장"}
                      </p>
                      <span className="text-xs text-stone-faint">{log.date}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-stone">
                      {log.accuracy != null ? (
                        <span className={log.accuracy >= 0.95 ? "font-bold text-coral" : ""}>
                          {Math.round(log.accuracy * 100)}%
                        </span>
                      ) : (
                        <span className="text-stone-faint">완료</span>
                      )}
                      {log.duration_seconds != null && log.duration_seconds > 0 ? (
                        <span>{formatDuration(log.duration_seconds)}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="card-lift flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]">
      <span className="text-[10px] font-semibold tracking-wide text-stone">
        {label}
      </span>
      <span
        className={`font-serif text-2xl font-bold ${highlight ? "text-coral" : "text-ink"}`}
      >
        {value}
      </span>
    </div>
  );
}

function Badge({ title, unlocked }: { title: string; unlocked: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[var(--radius-card)] border px-3 py-2.5 text-sm transition-all ${
        unlocked
          ? "border-coral/25 bg-coral-soft text-ink shadow-[var(--shadow-card)]"
          : "border-hairline text-stone-faint opacity-40 grayscale"
      }`}
    >
      <span className={unlocked ? "font-bold" : ""}>{title}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}
