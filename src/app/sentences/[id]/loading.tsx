import { Skeleton } from "@/components/Skeleton";

/** 문장 상세 스켈레톤: 큰 문장 + 출처/감정 + 감상 목록 */
export default function SentenceDetailLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:flex-row lg:gap-10">
      {/* 문장 본문 */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-7 w-2/3" />
      </div>

      {/* 출처 + 감정 pill */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-32 rounded-[var(--radius-pill)]" />
        <Skeleton className="h-7 w-16 rounded-[var(--radius-pill)]" />
      </div>

      {/* 좋아요 + 공유 */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* 감상 섹션 */}
      <Skeleton className="h-3 w-14 opacity-60" />
      <Skeleton className="h-20 w-full rounded-[var(--radius-input)]" />
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border-t border-hairline pt-4"
        >
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4 opacity-60" />
          <Skeleton className="h-2.5 w-20 opacity-30" />
        </div>
      ))}
    </main>
  );
}
