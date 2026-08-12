import { Skeleton, SentenceCardSkeleton } from "@/components/Skeleton";

/** 내 보관함 스켈레톤: 타이틀 + 월간 요약 + 카드 목록 */
export default function MyLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      {/* 타이틀 + 배지 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-28 rounded-[var(--radius-pill)]" />
      </div>

      {/* 월간 요약 카드 */}
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 opacity-60" />
          <Skeleton className="h-3 w-28 opacity-40" />
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16 opacity-50" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16 opacity-50" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>

      {/* 검색바 */}
      <Skeleton className="h-10 w-full rounded-[var(--radius-input)]" />

      {/* 카드 목록 */}
      {[0, 1, 2].map((i) => (
        <SentenceCardSkeleton key={i} />
      ))}
    </main>
  );
}
