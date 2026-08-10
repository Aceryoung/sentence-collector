import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavMenu } from "@/components/NavMenu";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-paper/90 sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-hairline px-4 py-4 backdrop-blur sm:px-6">
      <Link href="/" className="shrink-0 font-serif text-base text-ink sm:text-lg">
        글적<span className="text-archive">.</span>
      </Link>
      <nav className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-stone sm:gap-4">
        {/* 로그인 상태에서는 "보관함"(핵심 회수 경로)을 상시 노출하고 랭킹을 메뉴로
            넣는다. 비로그인 상태에는 보관함이 없으니 랭킹을 그대로 노출한다. */}
        <Link
          href="/ranking"
          className={user ? "hidden hover:text-ink sm:inline" : "hover:text-ink"}
        >
          랭킹
        </Link>
        {user ? (
          <>
            <Link href="/my" className="hover:text-ink">
              보관함
            </Link>
            <Link
              href="/write"
              className="rounded-[var(--radius-pill)] border-none bg-archive px-3 py-1.5 text-archive-contrast"
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
