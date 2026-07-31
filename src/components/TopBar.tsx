import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-paper/90 sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-hairline px-4 py-4 backdrop-blur sm:px-6">
      <Link href="/" className="shrink-0 font-serif text-base text-ink sm:text-lg">
        문장서고<span className="text-archive">.</span>
      </Link>
      <nav className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-stone sm:gap-4">
        <Link href="/ranking" className="hover:text-ink">
          랭킹
        </Link>
        {user ? (
          <>
            <Link href="/my" className="hover:text-ink">
              내 보관함
            </Link>
            <Link
              href="/write"
              className="border-none bg-archive px-2.5 py-1.5 text-archive-contrast"
            >
              <span aria-hidden="true">+</span>
              <span className="sr-only sm:not-sr-only sm:ml-1">등록</span>
            </Link>
            <form action={signOut}>
              <button type="submit" className="hover:text-ink">
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="hover:text-ink">
            로그인
          </Link>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
}
