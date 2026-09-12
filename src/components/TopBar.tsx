import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavMenu } from "@/components/NavMenu";
import { NotificationBadge } from "@/components/NotificationBadge";
import { UserMenu } from "@/components/UserMenu";

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
    <header aria-label="글적 상단 내비게이션" className="sticky top-0 z-10 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link
          href="/"
          className="shrink-0"
          aria-label="글적 홈"
        >
          <span
            className="inline-block h-9 w-[72px] bg-ink"
            style={{
              WebkitMaskImage: "url(/brand/geuljeok-logo.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskImage: "url(/brand/geuljeok-logo.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink href="/practice">필사</NavLink>
          {user ? <NavLink href="/feed">피드</NavLink> : null}
          <NavLink href="/ranking">랭킹</NavLink>
          <NavLink href="/challenges">챌린지</NavLink>
          <Link
            href="/search"
            className="ml-1 rounded-full p-2 text-stone transition-colors duration-200 hover:bg-surface hover:text-ink"
            aria-label="검색"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
        </nav>

        {/* 액션 영역 */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NotificationBadge count={unreadCount} />

              <Link
                href="/write"
                className="ml-1 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-cta px-3.5 py-1.5 text-xs font-bold text-cta-contrast transition-all duration-200 hover:bg-cta-hover hover:shadow-md"
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

              {/* 데스크탑 사용자 메뉴 (닉네임 + 로그아웃) */}
              <UserMenu
                nickname={(user.user_metadata?.nickname as string) ?? null}
                email={user.email ?? ""}
                isAdmin={user.email === process.env.ADMIN_EMAIL}
              />

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
                className="rounded-[var(--radius-pill)] border border-hairline-strong px-3.5 py-1.5 text-xs font-bold text-ink transition-all duration-200 hover:border-archive hover:text-archive hover:shadow-sm"
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
      className={`relative inline-flex min-h-[44px] items-center px-2.5 text-xs font-medium text-stone transition-colors duration-200 hover:text-ink ${className}`}
    >
      {children}
    </Link>
  );
}
