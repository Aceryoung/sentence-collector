"use client";

import { useActionState, useState } from "react";
import { createCollection, type CollectionState } from "../actions";

const initialState: CollectionState = { error: null };

export function NewCollectionForm() {
  const [state, formAction, isPending] = useActionState(
    createCollection,
    initialState,
  );
  const [title, setTitle] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-stone">
          컬렉션 이름
        </span>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          required
          placeholder="예: 위로가 되는 문장"
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        />
        <span className="self-end text-[10px] tabular-nums text-stone-faint">
          {title.length}/50
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-stone">
          설명 (선택)
        </span>
        <textarea
          name="description"
          maxLength={200}
          rows={2}
          placeholder="이 컬렉션은 어떤 문장들을 모으나요?"
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublic"
          className="h-4 w-4 rounded border-hairline-strong accent-cta"
        />
        <span className="text-sm text-stone">공개 컬렉션으로 만들기</span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-xs font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {isPending ? "만드는 중…" : "컬렉션 만들기"}
      </button>

      {state.error ? (
        <p className="text-xs text-coral">{state.error}</p>
      ) : null}
    </form>
  );
}
