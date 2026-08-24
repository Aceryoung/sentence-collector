import { Skeleton, SentenceCardSkeleton } from "@/components/Skeleton";

/** 내 보관함 스켈레톤: 헤더 + 스탯 + 탭 + 카드 그리드 */
export default function MyLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-56 opacity-60" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-16 w-28 rounded-[var(--radius-card)]" />
          <Skeleton className="h-16 w-28 rounded-[var(--radius-card)]" />
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 border-b border-hairline">
        {["내 문장", "좋아요", "내 생각", "여정"].map((label) => (
          <Skeleton key={label} className="h-9 w-16 rounded-t" />
        ))}
      </div>

      {/* 검색바 */}
      <Skeleton className="h-10 w-full rounded-[var(--radius-input)]" />

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SentenceCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
