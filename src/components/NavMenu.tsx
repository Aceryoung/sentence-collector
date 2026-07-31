"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="메뉴 열기"
        aria-expanded={open}
        className="border border-hairline-strong px-2 py-1 text-sm hover:border-archive hover:text-ink"
      >
        ⋯
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 flex w-40 flex-col border border-hairline-strong bg-surface py-1 font-mono text-xs text-stone">
          <Link
            href="/my"
            className="px-3 py-2 hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            내 보관함
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <span>테마</span>
            <ThemeToggle />
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full px-3 py-2 text-left hover:bg-paper hover:text-ink"
            >
              로그아웃
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
