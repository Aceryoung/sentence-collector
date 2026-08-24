import { Skeleton } from "@/components/Skeleton";

/** 챌린지 페이지 스켈레톤: 마스코트 + 타이틀 + 카드 */
export default function ChallengesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-8 shrink-0" />
        <Skeleton className="h-6 w-28" />
      </div>

      {/* 섹션 라벨 */}
      <Skeleton className="h-3 w-14 opacity-50" />

      {/* 챌린지 카드 */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-4 shadow-[var(--shadow-card)]"
        >
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-3.5 w-full opacity-60" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-14 opacity-40" />
            <Skeleton className="h-3 w-16 opacity-40" />
          </div>
        </div>
      ))}
    </main>
  );
}
