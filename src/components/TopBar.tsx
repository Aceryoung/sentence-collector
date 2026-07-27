import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-paper/90 sticky top-0 z-10 flex items-center justify-between border-b border-hairline px-6 py-4 backdrop-blur">
      <Link href="/" className="font-serif text-lg text-ink">
        문장서고<span className="text-archive">.</span>
      </Link>
      <nav className="flex items-center gap-4 font-mono text-xs text-stone">
        {user ? (
          <>
            <Link href="/my" className="hover:text-ink">
              내 보관함
            </Link>
            <Link
              href="/write"
              className="border-none bg-archive px-3 py-1.5 text-archive-contrast"
            >
              + 등록
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
      </nav>
    </header>
  );
}
