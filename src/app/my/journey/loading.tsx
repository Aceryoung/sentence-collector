import { Skeleton, StatCardSkeleton } from "@/components/Skeleton";

/** 나의 여정 스켈레톤: 타이틀 + 마스코트 카드 + 통계 + 히트맵 */
export default function JourneyLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      {/* 타이틀 + 스트릭 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24 rounded-[var(--radius-pill)]" />
      </div>

      {/* 마스코트 피드백 카드 */}
      <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <Skeleton className="h-14 w-10 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4 opacity-60" />
        </div>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* 히트맵 카드 */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]">
        <Skeleton className="h-3 w-24 opacity-60" />
        <Skeleton className="h-20 w-full opacity-30" />
      </div>

      {/* 성취 배지 */}
      <Skeleton className="h-3 w-10 opacity-60" />
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-[var(--radius-card)]" />
        ))}
      </div>
    </main>
  );
}
