"use client";

import { useActionState, useState } from "react";
import { createSentence, type CreateSentenceState } from "./actions";
import { SENTENCE_BODY_MAX_LENGTH, SOURCE_MAX_LENGTH, COMMENTARY_MIN_LENGTH, COMMENTARY_MAX_LENGTH, EMOTION_TAGS } from "@/lib/validation";

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
  const [selectedTag, setSelectedTag] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label
        htmlFor="body"
        className="text-xs font-bold uppercase tracking-widest text-stone"
      >
        문장
      </label>
      <textarea
        id="body"
        name="body"
        rows={5}
        maxLength={SENTENCE_BODY_MAX_LENGTH}
        onChange={(event) => setBodyLength(event.target.value.length)}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-3 text-ink leading-relaxed outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        placeholder="마음에 드는 문장을 나눠주세요"
      />
      <p
        className={`self-end text-xs ${nearLimit ? "text-archive" : "text-stone-faint"}`}
      >
        {bodyLength}/{SENTENCE_BODY_MAX_LENGTH}
      </p>

      <label
        htmlFor="source"
        className="text-xs font-bold uppercase tracking-widest text-stone"
      >
        출처 (선택)
      </label>
      <input
        id="source"
        name="source"
        maxLength={SOURCE_MAX_LENGTH}
        className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-3 text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        placeholder="예: 보르헤스"
      />

      <label className="text-xs font-bold uppercase tracking-widest text-stone">
        이 문장에서 느낀 감정
      </label>
      <input type="hidden" name="emotionTag" value={selectedTag} />
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="감정 태그 선택">
        {EMOTION_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            role="radio"
            aria-checked={selectedTag === tag}
            onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
            className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm transition-colors ${
              selectedTag === tag
                ? "border-archive bg-archive text-archive-contrast"
                : "border-hairline-strong bg-surface text-stone hover:border-archive/40 hover:text-ink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <label
        htmlFor="commentary"
        className="text-xs font-bold uppercase tracking-widest text-stone"
      >
        나의 감상 (선택)
      </label>
      <textarea
        id="commentary"
        name="commentary"
        rows={3}
        maxLength={COMMENTARY_MAX_LENGTH}
        onChange={(event) => setCommentaryLength(event.target.value.length)}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-3 text-ink italic leading-relaxed outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        placeholder="이 문장이 마음에 든 이유, 나만의 해석이나 느낀 점을 적어주세요"
      />
      <p
        className={`self-end text-xs ${
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
        <p className="text-xs text-archive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[var(--radius-pill)] border-none bg-cta px-4 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {isPending ? "등록하는 중…" : "등록하기"}
      </button>
    </form>
  );
}
