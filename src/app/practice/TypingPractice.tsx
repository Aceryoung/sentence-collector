"use client";

import { useActionState, useRef, useState } from "react";
import { logPractice, type LogPracticeState } from "./actions";
import { calculateAccuracy } from "@/lib/typing-accuracy";

const initialState: LogPracticeState = { error: null };

type Props = {
  sentenceId: string;
  originalText: string;
};

export function TypingPractice({ sentenceId, originalText }: Props) {
  const [state, formAction, isPending] = useActionState(logPractice, initialState);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const normalized = originalText.replace(/\s+/g, " ").trim();
  const progress = normalized.length > 0 ? Math.min(1, typed.length / normalized.length) : 0;

  function handleChange(value: string) {
    if (done) return;
    if (startTimeRef.current === null && value.length > 0) {
      startTimeRef.current = Date.now();
    }
    setTyped(value);
  }

  function handleComplete() {
    const acc = calculateAccuracy(originalText, typed);
    const elapsed = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;
    setAccuracy(acc);
    setDuration(elapsed);
    setDone(true);
  }

  // 실시간 글자 비교 렌더링
  const chars = normalized.split("");

  if (done && accuracy !== null) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-bold text-ink">필사 완료!</p>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-stone">정확도</span>
            <span className="font-serif text-2xl font-bold text-ink">
              {Math.round(accuracy * 100)}%
            </span>
          </div>
          {duration !== null && duration > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-xs text-stone">소요시간</span>
              <span className="font-serif text-2xl font-bold text-ink">
                {formatDuration(duration)}
              </span>
            </div>
          ) : null}
        </div>
        <form action={formAction}>
          <input type="hidden" name="sentenceId" value={sentenceId} />
          <input type="hidden" name="typedText" value={typed} />
          <input type="hidden" name="accuracy" value={accuracy.toString()} />
          {duration !== null ? (
            <input type="hidden" name="durationSeconds" value={duration.toString()} />
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-[var(--radius-pill)] border-none bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
          >
            {isPending ? "기록하는 중…" : "기록 저장"}
          </button>
          {state.error ? (
            <p className="mt-2 text-xs text-archive">{state.error}</p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 원문 대비 하이라이팅 */}
      <div className="rounded-[var(--radius-card)] border border-hairline bg-paper px-6 py-4 font-serif text-lg leading-loose" aria-hidden="true">
        {chars.map((char, i) => {
          if (i >= typed.length) {
            // 아직 입력 안 된 부분
            return (
              <span key={i} className="text-stone/30">
                {char}
              </span>
            );
          }
          const match = typed[i] === char;
          return (
            <span
              key={i}
              className={match ? "text-ink" : "text-coral underline"}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <textarea
        value={typed}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        className="resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-4 py-3 font-serif text-lg text-ink leading-loose outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        placeholder="위 문장을 보며 타이핑하세요"
      />

      {/* 진행률 */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
          <div
            className="ink-progress-bar h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-stone">
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* 완료 버튼 */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={typed.trim().length === 0}
        className="self-center rounded-[var(--radius-pill)] border-none bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        타이핑 완료
      </button>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}
