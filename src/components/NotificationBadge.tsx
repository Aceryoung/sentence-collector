import Link from "next/link";

export function NotificationBadge({ count }: { count: number }) {
  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-input)] text-stone transition-colors hover:bg-surface hover:text-ink"
      aria-label={count > 0 ? `알림 ${count}개` : "알림"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-cta-contrast">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
