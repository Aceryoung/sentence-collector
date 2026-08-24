"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { SentenceCard } from "@/components/SentenceCard";
import { EMOTION_TAGS } from "@/lib/validation";

type Sentence = {
  id: string;
  body: string;
  source: string | null;
  commentary: string | null;
  emotionTag: string | null;
  likeCount: number;
};

type SortKey = "newest" | "oldest" | "likes";

export function MyArchive({ sentences }: { sentences: Sentence[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  // 사용자의 커스텀 태그 수집 (프리셋에 없는 것만)
  const customTags = useMemo(() => {
    const presetSet = new Set<string>(EMOTION_TAGS);
    const custom = new Set<string>();
    for (const s of sentences) {
      if (s.emotionTag && !presetSet.has(s.emotionTag)) {
        custom.add(s.emotionTag);
      }
    }
    return Array.from(custom).sort();
  }, [sentences]);

  const allTags = useMemo(
    () => [...EMOTION_TAGS, ...customTags],
    [customTags],
  );

  const filtered = useMemo(() => {
    let result = sentences;

    // 태그 필터
    if (activeTag) {
      result = result.filter((s) => s.emotionTag === activeTag);
    }

    // 텍스트 검색
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.body.toLowerCase().includes(q) ||
          (s.source ?? "").toLowerCase().includes(q) ||
          (s.commentary ?? "").toLowerCase().includes(q),
      );
    }

    // 정렬
    if (sortBy === "likes") {
      result = [...result].sort((a, b) => b.likeCount - a.likeCount);
    } else if (sortBy === "oldest") {
      result = [...result].reverse();
    }
    // "newest"는 서버에서 이미 최신순

    return result;
  }, [sentences, query, activeTag, sortBy]);

  if (sentences.length === 0) {
    return (
      <EmptyState
        withMascot
        message="아직 모은 문장이 없어요."
        action={
          <Link
            href="/write"
            className="rounded-[var(--radius-pill)] bg-archive px-4 py-2 text-sm text-archive-contrast"
          >
            첫 문장 남기기
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-faint" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="태그, 키워드, 저자로 검색…"
            className="w-full rounded-[var(--radius-input)] border border-hairline-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
          />
        </div>
      </div>

      {/* 태그 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="감정 태그 필터">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`shrink-0 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
            activeTag === null
              ? "border-archive bg-archive text-archive-contrast"
              : "border-hairline-strong bg-surface text-stone hover:border-archive/40 hover:text-ink"
          }`}
        >
          전체
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`shrink-0 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
              activeTag === tag
                ? "border-archive bg-archive text-archive-contrast"
                : "border-hairline-strong bg-surface text-stone hover:border-archive/40 hover:text-ink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-2 py-1 text-xs text-stone outline-none"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone">
          {query
            ? `'${query}'와 일치하는 문장이 없어요.`
            : activeTag
              ? `'${activeTag}' 태그의 문장이 없어요.`
              : "문장이 없어요."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((sentence) => (
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
      )}
    </div>
  );
}
