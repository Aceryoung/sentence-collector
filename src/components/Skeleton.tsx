/**
 * 스켈레톤 UI 프리미티브.
 *
 * 페이지 로딩 중 콘텐츠 자리를 잡아주는 뼈대.
 * 디자인 토큰(--surface, --hairline)을 사용해 브랜드와 일관성을 유지한다.
 */

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-card)] bg-surface ${className}`}
    />
  );
}

/** 문장 카드 모양의 스켈레톤 */
export function SentenceCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-surface px-5 py-5 shadow-[var(--shadow-card)]">
      <div className="h-5 w-4/5 animate-pulse rounded bg-hairline" />
      <div className="h-5 w-3/5 animate-pulse rounded bg-hairline" />
      <div className="h-3 w-2/5 animate-pulse rounded bg-hairline opacity-60" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-20 animate-pulse rounded-[var(--radius-pill)] bg-hairline opacity-50" />
        <div className="h-6 w-14 animate-pulse rounded-[var(--radius-pill)] bg-hairline opacity-50" />
      </div>
    </div>
  );
}

/** 통계 카드 스켈레톤 */
export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-hairline bg-surface px-4 py-3.5 shadow-[var(--shadow-card)]">
      <div className="h-2.5 w-12 animate-pulse rounded bg-hairline opacity-60" />
      <div className="h-7 w-10 animate-pulse rounded bg-hairline" />
    </div>
  );
}
