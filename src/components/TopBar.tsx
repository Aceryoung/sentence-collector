import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
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
    <header className="bg-paper/90 sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-hairline px-4 py-4 backdrop-blur sm:px-6">
      <Link href="/" className="shrink-0 font-serif text-base font-bold text-ink sm:text-lg">
        글적<span className="text-archive">.</span>
      </Link>
      <nav className="flex items-center gap-2 text-xs whitespace-nowrap text-stone sm:gap-4">
        <Link
          href="/ranking"
          className={user ? "hidden hover:text-ink sm:inline" : "hover:text-ink"}
        >
          랭킹
        </Link>
        <Link
          href="/challenges"
          className={user ? "hidden hover:text-ink sm:inline" : "hover:text-ink"}
        >
          챌린지
        </Link>
        {user ? (
          <>
            <Link href="/my" className="hover:text-ink">
              보관함
            </Link>
            <NotificationBadge count={unreadCount} />
            <Link
              href="/write"
              className="rounded-[var(--radius-pill)] border-none bg-cta px-3 py-1.5 font-bold text-cta-contrast transition-colors hover:bg-cta-hover"
            >
              <span aria-hidden="true">+</span>
              <span className="sr-only sm:not-sr-only sm:ml-1">등록</span>
            </Link>
            <form action={signOut} className="hidden sm:block">
              <button type="submit" className="hover:text-ink">
                로그아웃
              </button>
            </form>
            <span className="hidden sm:inline-flex">
              <ThemeToggle />
            </span>
            <NavMenu />
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-ink">
              로그인
            </Link>
            <ThemeToggle />
          </>
        )}
      </nav>
    </header>
  );
}
