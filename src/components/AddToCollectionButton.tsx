"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addToCollection, getMyCollections } from "@/app/collections/actions";

type Collection = { id: string; title: string };

export function AddToCollectionButton({ sentenceId }: { sentenceId: string }) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getMyCollections()
      .then(setCollections)
      .finally(() => setLoading(false));

    function handleClick(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open]);

  function handleAdd(collectionId: string) {
    startTransition(async () => {
      await addToCollection(collectionId, sentenceId);
      setAdded(collectionId);
      setTimeout(() => {
        setAdded(null);
        setOpen(false);
      }, 1000);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="컬렉션에 추가"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone transition-colors hover:border-archive hover:text-ink"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        담기
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 flex w-52 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline-strong bg-surface py-1 text-xs shadow-[var(--shadow-card)]">
          {loading ? (
            <p className="px-3 py-3 text-stone-faint">불러오는 중...</p>
          ) : collections.length > 0 ? (
            collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleAdd(c.id)}
                disabled={isPending}
                className="min-h-11 px-3 py-3 text-left text-stone hover:bg-paper hover:text-ink disabled:opacity-60"
              >
                {added === c.id ? "✓ 추가됨" : c.title}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-stone-faint">컬렉션이 없어요</p>
          )}
          <div className="border-t border-hairline">
            <a
              href="/collections/new"
              className="block min-h-11 px-3 py-3 text-archive hover:bg-paper"
            >
              + 새 컬렉션 만들기
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
