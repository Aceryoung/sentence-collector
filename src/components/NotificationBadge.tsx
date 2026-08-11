import Link from "next/link";

export function NotificationBadge({ count }: { count: number }) {
  return (
    <Link
      href="/notifications"
      className="relative hover:text-ink"
      aria-label={count > 0 ? `알림 ${count}개` : "알림"}
    >
      🔔
      {count > 0 ? (
        <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-archive px-1 text-[10px] font-bold text-archive-contrast">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
