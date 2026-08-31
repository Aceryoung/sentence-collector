"use client";

import { useTransition } from "react";
import { deleteCollection } from "../actions";

export function DeleteCollectionButton({ collectionId }: { collectionId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 컬렉션을 삭제할까요? 안의 문장은 사라지지 않아요.")) return;
    startTransition(() => deleteCollection(collectionId));
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="shrink-0 rounded-[var(--radius-pill)] border border-hairline-strong px-3 py-1.5 text-xs text-stone transition-colors hover:border-coral hover:text-coral disabled:opacity-60"
    >
      {isPending ? "삭제 중…" : "삭제"}
    </button>
  );
}
