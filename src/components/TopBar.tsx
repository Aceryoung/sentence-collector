import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavMenu } from "@/components/NavMenu";
import { NotificationBadge } from "@/components/NotificationBadge";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미읽은 알림 수
  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    unreadCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        {/* 로고 */}
        <Link
          href="/"
          className="shrink-0 font-serif text-lg font-bold tracking-tight text-ink"
        >
          글적<span className="text-archive">.</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/practice">필사</NavLink>
          <NavLink href="/ranking">랭킹</NavLink>
          <NavLink href="/challenges">챌린지</NavLink>
        </nav>

        {/* 액션 영역 */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              {/* 데스크탑 전용 액션 */}
              <NavLink href="/my" className="hidden sm:inline-flex">
                보관함
              </NavLink>

              <span className="mx-1 hidden h-4 w-px bg-hairline sm:inline-block" aria-hidden="true" />

              <NotificationBadge count={unreadCount} />

              <Link
                href="/write"
                className="ml-1 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-cta px-3.5 py-1.5 text-xs font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span className="hidden sm:inline">등록</span>
              </Link>

              <span className="mx-1 hidden h-4 w-px bg-hairline sm:inline-block" aria-hidden="true" />

              <span className="hidden sm:inline-flex">
                <ThemeToggle />
              </span>

              {/* 모바일 햄버거 */}
              <NavMenu />
            </>
          ) : (
            <>
              {/* 비로그인 — 모바일에서도 핵심 링크 표시 */}
              <NavLink href="/ranking" className="sm:hidden">
                랭킹
              </NavLink>
              <NavLink href="/challenges" className="sm:hidden">
                챌린지
              </NavLink>

              <span className="mx-1 hidden h-4 w-px bg-hairline sm:inline-block" aria-hidden="true" />

              <Link
                href="/login"
                className="rounded-[var(--radius-pill)] border border-hairline-strong px-3.5 py-1.5 text-xs font-bold text-ink transition-colors hover:border-archive hover:text-archive"
              >
                로그인
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative px-2.5 py-1.5 text-xs text-stone transition-colors hover:text-ink ${className}`}
    >
      {children}
    </Link>
  );
}
