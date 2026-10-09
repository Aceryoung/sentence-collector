"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSentence, acceptSuggestedTags, type CreateSentenceState } from "./actions";
import { SENTENCE_BODY_MAX_LENGTH, SOURCE_MAX_LENGTH, COMMENTARY_MIN_LENGTH, COMMENTARY_MAX_LENGTH, EMOTION_TAGS } from "@/lib/validation";

const initialState: CreateSentenceState = { error: null };

export function WriteForm() {
  const router = useRouter();
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
  const [acceptingTag, setAcceptingTag] = useState(false);

  useEffect(() => {
    if (state.success && state.success.suggestedTags.length === 0) {
      router.push("/my");
    }
  }, [state.success, router]);

  async function handleAcceptTag(tag: string) {
    if (!state.success) return;
    setAcceptingTag(true);
    await acceptSuggestedTags(state.success.sentenceId, [tag]);
    router.push("/my");
  }

  function handleSkip() {
    router.push("/my");
  }

  if (state.success && state.success.suggestedTags.length > 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex flex-col gap-2">
          <p className="font-serif text-lg font-bold text-ink">저장 완료</p>
          <p className="text-sm text-stone">
            AI가 추천하는 감정 태그예요. 하나를 선택하면 이 문장에 추가됩니다.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {state.success.suggestedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={acceptingTag}
              onClick={() => handleAcceptTag(tag)}
              className="rounded-[var(--radius-pill)] border border-archive/40 bg-surface px-4 py-2 text-sm text-ink transition-all hover:border-archive hover:bg-archive/10 hover:shadow-sm active:scale-95 disabled:opacity-60"
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={acceptingTag}
          className="text-xs text-stone underline underline-offset-4 hover:text-ink disabled:opacity-60"
        >
          건너뛰기
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.error && <p role="alert" className="text-sm text-coral">{state.error}</p>}
      {/* THE SENTENCE */}
      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor="body"
          className="text-xs font-semibold tracking-wide text-stone"
        >
          문장
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          maxLength={SENTENCE_BODY_MAX_LENGTH}
          onChange={(event) => setBodyLength(event.target.value.length)}
          className="resize-none border-b-2 border-hairline-strong bg-transparent px-0 py-3 font-serif text-lg text-ink leading-relaxed outline-none transition-colors placeholder:text-stone-faint/60 focus-visible:border-cta"
          placeholder="마음에 드는 문장을 적어주세요…"
        />
        <p
          className={`self-end text-xs ${nearLimit ? "text-coral" : "text-stone-faint"}`}
        >
          {bodyLength}/{SENTENCE_BODY_MAX_LENGTH}
        </p>
      </fieldset>

      {/* AUTHOR / SOURCE */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <label
            htmlFor="source"
            className="text-xs font-semibold tracking-wide text-stone"
          >
            저자 / 출처
          </label>
          <input
            id="source"
            name="source"
            maxLength={SOURCE_MAX_LENGTH}
            className="border-b-2 border-hairline-strong bg-transparent px-0 py-2 text-ink outline-none transition-colors placeholder:text-stone-faint/60 focus-visible:border-cta"
            placeholder="예: 무라카미 하루키"
          />
        </fieldset>
      </div>

      {/* PRIMARY EMOTION */}
      <fieldset className="flex flex-col gap-3">
        <label className="text-xs font-semibold tracking-wide text-stone">
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
              className={`flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-4 py-2 text-sm transition-all duration-200 ${
                selectedTag === tag
                  ? "border-archive bg-archive text-archive-contrast shadow-sm"
                  : "border-hairline-strong bg-surface text-stone hover:border-archive/40 hover:text-ink hover:shadow-sm active:scale-95"
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
              className="w-36 border-b border-hairline-strong bg-transparent px-0 py-1.5 text-sm text-ink outline-none transition-colors focus-visible:border-cta"
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
              삭제
            </button>
          </div>
        ) : null}
      </fieldset>

      {/* YOUR REFLECTION */}
      <fieldset className="flex flex-col gap-2">
        <label
          htmlFor="commentary"
          className="text-xs font-semibold tracking-wide text-stone"
        >
          나의 감상 (선택)
        </label>
        <textarea
          id="commentary"
          name="commentary"
          rows={3}
          maxLength={COMMENTARY_MAX_LENGTH}
          onChange={(event) => setCommentaryLength(event.target.value.length)}
          className="resize-none border-b-2 border-hairline-strong bg-transparent px-0 py-3 text-ink italic leading-relaxed outline-none transition-colors placeholder:text-stone-faint/60 focus-visible:border-cta"
          placeholder="이 문장이 오늘 당신에게 특별한 이유는?"
        />
        <p
          className={`self-end text-xs ${
            commentaryShort
              ? "text-coral"
              : commentaryNearLimit
                ? "text-coral"
                : "text-stone-faint"
          }`}
        >
          {commentaryLength}/{COMMENTARY_MAX_LENGTH}
          {commentaryShort ? ` (${COMMENTARY_MIN_LENGTH}자 이상)` : ""}
        </p>
      </fieldset>

      {state.error ? (
        <p className="text-xs text-coral">{state.error}</p>
      ) : null}

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-4 border-t border-hairline pt-6">
        <a
          href="/"
          className="text-xs font-semibold tracking-wide text-stone transition-colors hover:text-ink"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border-none bg-cta px-6 py-2.5 text-sm font-bold text-cta-contrast transition-all duration-200 hover:bg-cta-hover hover:shadow-md disabled:opacity-60"
        >
          {isPending ? "등록하는 중…" : "보관함에 저장"}
          {!isPending ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          ) : null}
        </button>
      </div>
    </form>
  );
}
