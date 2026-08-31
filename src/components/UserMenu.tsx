"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";

type Props = {
  nickname: string | null;
  email: string;
};

export function UserMenu({ nickname, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const displayName = nickname || email.split("@")[0];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="사용자 메뉴"
        className="flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone transition-colors hover:border-archive hover:text-ink"
      >
        <span className="max-w-[100px] truncate">{displayName}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 flex w-44 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline-strong bg-surface py-1 text-xs shadow-[var(--shadow-card)]">
          <div className="border-b border-hairline px-3 py-2.5">
            <p className="truncate font-bold text-ink">{displayName}</p>
            <p className="truncate text-stone-faint">{email}</p>
          </div>
          <Link
            href="/my"
            className="min-h-11 px-3 py-3 text-stone hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            보관함
          </Link>
          <Link
            href="/settings"
            className="min-h-11 px-3 py-3 text-stone hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            계정 설정
          </Link>
          <div className="border-t border-hairline">
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 w-full px-3 py-3 text-left text-stone hover:bg-paper hover:text-ink"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
