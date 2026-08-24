import { Skeleton } from "@/components/Skeleton";

/** 알림 페이지 스켈레톤: 타이틀 + 알림 목록 */
export default function NotificationsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      {/* 타이틀 + 배지 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-24 rounded-[var(--radius-pill)]" />
      </div>

      {/* 알림 목록 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex gap-3 border-b border-hairline px-2 py-4"
        >
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full opacity-50" />
            <Skeleton className="h-2.5 w-20 opacity-30" />
          </div>
        </div>
      ))}
    </main>
  );
}
