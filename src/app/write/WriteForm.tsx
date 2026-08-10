"use client";

import { useActionState, useState } from "react";
import { createSentence, type CreateSentenceState } from "./actions";
import { SENTENCE_BODY_MAX_LENGTH, SOURCE_MAX_LENGTH, COMMENTARY_MIN_LENGTH, COMMENTARY_MAX_LENGTH } from "@/lib/validation";

const initialState: CreateSentenceState = { error: null };

export function WriteForm() {
  const [state, formAction, isPending] = useActionState(
    createSentence,
    initialState,
  );
  const [bodyLength, setBodyLength] = useState(0);
  const nearLimit = bodyLength > SENTENCE_BODY_MAX_LENGTH - 20;
  const [commentaryLength, setCommentaryLength] = useState(0);
  const commentaryShort = commentaryLength > 0 && commentaryLength < COMMENTARY_MIN_LENGTH;
  const commentaryNearLimit = commentaryLength > COMMENTARY_MAX_LENGTH - 20;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label
        htmlFor="body"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        문장
      </label>
      <textarea
        id="body"
        name="body"
        rows={5}
        maxLength={SENTENCE_BODY_MAX_LENGTH}
        onChange={(event) => setBodyLength(event.target.value.length)}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        placeholder="마음에 드는 문장을 나눠주세요"
      />
      <p
        className={`self-end font-mono text-xs ${nearLimit ? "text-archive" : "text-stone-faint"}`}
      >
        {bodyLength}/{SENTENCE_BODY_MAX_LENGTH}
      </p>

      <label
        htmlFor="source"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        출처 (선택)
      </label>
      <input
        id="source"
        name="source"
        maxLength={SOURCE_MAX_LENGTH}
        className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        placeholder="예: 보르헤스"
      />

      <label
        htmlFor="commentary"
        className="font-mono text-xs uppercase tracking-wide text-stone"
      >
        나의 감상 (필수)
      </label>
      <textarea
        id="commentary"
        name="commentary"
        rows={3}
        maxLength={COMMENTARY_MAX_LENGTH}
        onChange={(event) => setCommentaryLength(event.target.value.length)}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        placeholder="이 문장이 마음에 든 이유, 나만의 해석이나 느낀 점을 적어주세요"
      />
      <p
        className={`self-end font-mono text-xs ${
          commentaryShort
            ? "text-archive"
            : commentaryNearLimit
              ? "text-archive"
              : "text-stone-faint"
        }`}
      >
        {commentaryLength}/{COMMENTARY_MAX_LENGTH}
        {commentaryShort ? ` (${COMMENTARY_MIN_LENGTH}자 이상)` : ""}
      </p>

      {state.error ? (
        <p className="font-mono text-xs text-archive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[var(--radius-pill)] border-none bg-archive px-3 py-2 font-mono text-sm text-archive-contrast disabled:opacity-60"
      >
        {isPending ? "등록하는 중…" : "등록하기"}
      </button>
    </form>
  );
}
