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
      {/* 커스텀 태그 직접 입력 */}
      {!EMOTION_TAGS.includes(selectedTag as typeof EMOTION_TAGS[number]) && selectedTag !== "" ? null : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="또는 직접 입력"
            maxLength={20}
            className="w-32 rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-1.5 text-sm text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val) {
                  setSelectedTag(val);
                  e.currentTarget.value = "";
                }
              }
            }}
          />
          <span className="text-xs text-stone-faint">Enter로 추가</span>
        </div>
      )}
      {/* 커스텀 태그가 선택된 경우 표시 */}
      {selectedTag && !EMOTION_TAGS.includes(selectedTag as typeof EMOTION_TAGS[number]) ? (
        <div className="flex items-center gap-2">
          <span className="rounded-[var(--radius-pill)] border border-archive bg-archive px-3 py-1.5 text-sm text-archive-contrast">
            {selectedTag}
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag("")}
            className="text-xs text-stone hover:text-ink"
          >
            ✕
          </button>
        </div>
      ) : null}

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
