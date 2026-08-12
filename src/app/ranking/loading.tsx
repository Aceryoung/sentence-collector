import { Skeleton, SentenceCardSkeleton } from "@/components/Skeleton";

/** 랭킹 페이지 스켈레톤: 타이틀 + 탭 + 카드 목록 */
export default function RankingLoading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
      {/* 타이틀 */}
      <Skeleton className="h-6 w-16" />

      {/* 기간 탭 */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className="h-8 w-14 rounded-[var(--radius-pill)]"
          />
        ))}
      </div>

      {/* 기간 표시 */}
      <Skeleton className="h-3 w-36 opacity-50" />

      {/* 랭킹 카드 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="mt-5 h-4 w-6 shrink-0" />
          <div className="flex-1">
            <SentenceCardSkeleton />
          </div>
        </div>
      ))}
    </main>
  );
}
