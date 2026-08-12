"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "📖" },
  { href: "/write", label: "등록", icon: "✏️" },
  { href: "/my", label: "보관함", icon: "📂" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-hairline bg-paper/95 backdrop-blur sm:hidden"
      aria-label="주요 탐색"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] transition-colors ${
                  active
                    ? "font-bold text-cta"
                    : "text-stone hover:text-ink"
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
