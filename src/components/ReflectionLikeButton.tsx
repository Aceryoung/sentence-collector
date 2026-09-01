"use client";

import { useOptimistic, useTransition } from "react";
import { toggleReflectionLike } from "@/app/sentences/[id]/reflection-like-actions";

type Props = {
  reflectionId: string;
  sentenceId: string;
  liked: boolean;
  count: number;
};

export function ReflectionLikeButton({ reflectionId, sentenceId, liked, count }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked, count },
    (_cur, next: boolean) => ({
      liked: next,
      count: next ? _cur.count + 1 : Math.max(0, _cur.count - 1),
    }),
  );

  function handleClick() {
    startTransition(async () => {
      setOptimistic(!optimistic.liked);
      await toggleReflectionLike(reflectionId, sentenceId, optimistic.liked ? "unlike" : "like");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={optimistic.liked ? "공감 취소" : "공감"}
      className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs transition-colors ${
        optimistic.liked
          ? "bg-coral/10 text-coral"
          : "text-stone hover:bg-surface hover:text-ink"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={optimistic.liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {optimistic.count > 0 && (
        <span className="tabular-nums">{optimistic.count}</span>
      )}
    </button>
  );
}
