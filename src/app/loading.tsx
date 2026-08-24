import { Skeleton, SentenceCardSkeleton } from "@/components/Skeleton";

/** 홈 피드 스켈레톤: 사이드바 + 2컬럼 피드 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">

        {/* 사이드바 스켈레톤 */}
        <aside className="flex shrink-0 flex-col gap-5 lg:w-80">
          {/* 마스코트 인사 */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-[41px] shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
          {/* CTA */}
          <Skeleton className="h-16 w-full rounded-[var(--radius-card)]" />
          <Skeleton className="h-[72px] w-full rounded-[var(--radius-card)]" />
        </aside>

        {/* 피드 스켈레톤 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-20" />
            {/* 태그 필터 */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-14 rounded-full" />
              ))}
            </div>
            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <SentenceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
