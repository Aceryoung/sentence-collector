import { Skeleton } from "@/components/Skeleton";

/** 필사 페이지 스켈레톤: 라벨 + 문장 카드 + 진행바 */
export default function PracticeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-12 sm:px-6 lg:px-8">
      {/* 섹션 라벨 */}
      <Skeleton className="h-3.5 w-20 opacity-60" />

      {/* 문장 카드 */}
      <div className="flex w-full flex-col gap-4 rounded-[var(--radius-card)] border border-hairline bg-surface px-6 py-8 shadow-[var(--shadow-card)]">
        <Skeleton className="mx-auto h-6 w-4/5" />
        <Skeleton className="mx-auto h-6 w-3/5" />
      </div>

      {/* 출처 pill */}
      <Skeleton className="h-7 w-28 rounded-[var(--radius-pill)]" />

      {/* 진행바 영역 */}
      <Skeleton className="h-3 w-48 opacity-50" />
    </main>
  );
}
