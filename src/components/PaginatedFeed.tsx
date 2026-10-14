"use client";

import Link from "next/link";
import { SentenceCard } from "@/components/SentenceCard";
import type { SentenceCardData } from "@/lib/sentences";

type Props = {
  sentences: SentenceCardData[];
  currentPage: number;
  totalPages: number;
  tag?: string | null;
};

function buildHref(page: number, tag?: string | null): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function PaginatedFeed({
  sentences,
  currentPage,
  totalPages,
  tag,
}: Props) {
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="stagger-grid grid grid-cols-1 gap-4 md:grid-cols-2">
        {sentences.map((sentence) => (
          <SentenceCard
            key={sentence.id}
            id={sentence.id}
            body={sentence.body}
            source={sentence.source}
            commentary={sentence.commentary}
            emotionTag={sentence.emotionTag}
            likeCount={sentence.likeCount}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="페이지 이동"
          className="flex items-center justify-center gap-1 py-6"
        >
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1, tag)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone transition-colors hover:bg-paper hover:text-ink"
              aria-label="이전 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center text-stone-faint opacity-30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </span>
          )}

          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-9 w-9 items-center justify-center text-xs text-stone-faint"
              >
                ...
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref(p as number, tag)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors ${
                  p === currentPage
                    ? "bg-archive font-bold text-archive-contrast"
                    : "text-stone hover:bg-paper hover:text-ink"
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            ),
          )}

          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1, tag)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone transition-colors hover:bg-paper hover:text-ink"
              aria-label="다음 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center text-stone-faint opacity-30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </span>
          )}
        </nav>
      ) : sentences.length > 0 ? (
        <p className="py-6 text-center text-xs text-stone-faint">
          모든 문장을 불러왔어요
        </p>
      ) : null}
    </>
  );
}

function buildPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
