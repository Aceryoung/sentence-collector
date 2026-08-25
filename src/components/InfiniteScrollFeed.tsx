"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { SentenceCard } from "@/components/SentenceCard";
import { loadMoreSentences } from "@/app/actions/feed";
import type { SentenceCardData } from "@/lib/sentences";

type Props = {
  initialSentences: SentenceCardData[];
  tag?: string | null;
  excludeId?: string | null;
  /** 첫 페이지에 PAGE_SIZE 이상이면 더 불러올 수 있음 */
  initialHasMore: boolean;
};

export function InfiniteScrollFeed({
  initialSentences,
  tag,
  excludeId,
  initialHasMore,
}: Props) {
  const [sentences, setSentences] = useState(initialSentences);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(2); // 1페이지는 SSR
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // tag 변경 시 초기화
  useEffect(() => {
    setSentences(initialSentences);
    setHasMore(initialHasMore);
    setPage(2);
  }, [initialSentences, initialHasMore]);

  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return;
    startTransition(async () => {
      const result = await loadMoreSentences(page, tag, excludeId);
      setSentences((prev) => [...prev, ...result.sentences]);
      setHasMore(result.hasMore);
      setPage((p) => p + 1);
    });
  }, [isPending, hasMore, page, tag, excludeId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

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

      {/* 로딩 인디케이터 + 감시 센티넬 */}
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isPending ? (
            <span className="text-sm text-stone">불러오는 중…</span>
          ) : null}
        </div>
      ) : sentences.length > 0 ? (
        <p className="py-6 text-center text-xs text-stone-faint">
          모든 문장을 불러왔어요
        </p>
      ) : null}
    </>
  );
}
