"use client";

import { useActionState, useState } from "react";
import { createSentence, type CreateSentenceState } from "./actions";
import { SENTENCE_BODY_MAX_LENGTH, SOURCE_MAX_LENGTH } from "@/lib/validation";

const initialState: CreateSentenceState = { error: null };

export function WriteForm() {
  const [state, formAction, isPending] = useActionState(
    createSentence,
    initialState,
  );
  const [bodyLength, setBodyLength] = useState(0);
  const nearLimit = bodyLength > SENTENCE_BODY_MAX_LENGTH - 20;

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
        className="resize-none border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
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
        className="border border-hairline-strong bg-surface px-3 py-2 text-ink outline-none focus-visible:border-archive"
        placeholder="예: 보르헤스"
      />

      {state.error ? (
        <p className="font-mono text-xs text-archive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="border-none bg-archive px-3 py-2 font-mono text-sm text-archive-contrast disabled:opacity-60"
      >
        {isPending ? "등록하는 중…" : "등록하기"}
      </button>
    </form>
  );
}
