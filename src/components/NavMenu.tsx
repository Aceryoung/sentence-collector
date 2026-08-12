"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="메뉴 열기"
        aria-expanded={open}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-input)] border border-hairline-strong px-2 text-sm hover:border-archive hover:text-ink"
      >
        ⋯
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 flex w-40 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline-strong bg-surface py-1 text-xs text-stone shadow-[var(--shadow-card)]">
          <Link
            href="/ranking"
            className="min-h-11 px-3 py-3 hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            랭킹
          </Link>
          <Link
            href="/challenges"
            className="min-h-11 px-3 py-3 hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            챌린지
          </Link>
          <Link
            href="/my/journey"
            className="min-h-11 px-3 py-3 hover:bg-paper hover:text-ink"
            onClick={() => setOpen(false)}
          >
            나의 여정
          </Link>
          <div className="flex min-h-11 items-center justify-between px-3 py-3">
            <span>테마</span>
            <ThemeToggle />
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="min-h-11 w-full px-3 py-3 text-left hover:bg-paper hover:text-ink"
            >
              로그아웃
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
