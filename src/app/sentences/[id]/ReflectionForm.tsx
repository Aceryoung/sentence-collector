"use client";

import { useActionState, useState } from "react";
import { addReflection, type ReflectionState } from "./actions";

const initialState: ReflectionState = { error: null };

export function ReflectionForm({ sentenceId }: { sentenceId: string }) {
  const [state, formAction, isPending] = useActionState(
    addReflection,
    initialState,
  );
  const [length, setLength] = useState(0);
  const tooShort = length > 0 && length < 10;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="sentenceId" value={sentenceId} />
      <label
        htmlFor="reflection-body"
        className="text-xs uppercase tracking-wide text-stone"
      >
        나의 감상
      </label>
      <textarea
        id="reflection-body"
        name="body"
        rows={3}
        maxLength={500}
        onChange={(e) => setLength(e.target.value.length)}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        placeholder="이 문장에 대한 나만의 생각을 남겨보세요"
      />
      <div className="flex items-center justify-between">
        <p className={`text-xs ${tooShort ? "text-archive" : "text-stone-faint"}`}>
          {length}/500{tooShort ? " (10자 이상)" : ""}
        </p>
        {state.error ? (
          <p className="text-xs text-archive">{state.error}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-[var(--radius-pill)] border-none bg-archive px-4 py-2 text-sm text-archive-contrast disabled:opacity-60"
      >
        {isPending ? "등록하는 중…" : "감상 남기기"}
      </button>
    </form>
  );
}
