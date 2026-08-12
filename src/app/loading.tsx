import { Skeleton, SentenceCardSkeleton } from "@/components/Skeleton";

/** 홈 피드 스켈레톤: Hero + CTA + 카드 목록 */
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8">
      {/* Hero 카드 */}
      <div className="flex items-center gap-5 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-6 shadow-[var(--shadow-card)]">
        <Skeleton className="hidden h-16 w-12 shrink-0 sm:block" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-full opacity-60" />
        </div>
      </div>

      {/* CTA 바 */}
      <Skeleton className="h-12 w-full" />

      {/* 섹션 라벨 */}
      <Skeleton className="h-3 w-16 opacity-50" />

      {/* 카드 목록 */}
      {[0, 1, 2].map((i) => (
        <SentenceCardSkeleton key={i} />
      ))}
    </main>
  );
}
