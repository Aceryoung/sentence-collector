"use client";

import { useState, useTransition } from "react";
import { submitFeedback } from "@/app/feedback/actions";

const CATEGORIES = [
  { value: "bug", label: "버그 신고", emoji: "🐛" },
  { value: "suggestion", label: "제안", emoji: "💡" },
  { value: "general", label: "기타", emoji: "💬" },
] as const;

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("general");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleSubmit() {
    setResult(null);
    startTransition(async () => {
      const res = await submitFeedback(
        category,
        body,
        typeof window !== "undefined" ? window.location.href : null,
      );
      setResult(res);
      if (res.success) {
        setBody("");
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 2000);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-archive text-archive-contrast shadow-lg transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-11 sm:w-11"
        aria-label="피드백 보내기"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-2xl bg-surface px-5 py-6 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink">피드백</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-stone hover:text-ink"
                aria-label="닫기"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 카테고리 */}
            <div className="mb-3 flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-1 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs transition-all ${
                    category === c.value
                      ? "border-archive bg-archive text-archive-contrast"
                      : "border-hairline-strong text-stone hover:border-archive/40"
                  }`}
                >
                  <span>{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>

            {/* 내용 */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="어떤 점이 불편하거나, 어떤 기능이 있으면 좋겠나요?"
              rows={4}
              maxLength={2000}
              className="mb-1 w-full resize-none rounded-[var(--radius-input)] border border-hairline-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone/50 focus-visible:border-archive"
            />
            <div className="mb-3 text-right text-[10px] tabular-nums text-stone">
              {body.length}/2000
            </div>

            {result?.error ? (
              <p className="mb-3 text-xs text-coral">{result.error}</p>
            ) : null}
            {result?.success ? (
              <p className="mb-3 text-xs text-green-600">감사합니다! 피드백이 전달되었습니다.</p>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || body.trim().length < 5}
              className="w-full rounded-[var(--radius-pill)] bg-cta py-2.5 text-sm font-bold text-cta-contrast transition-all hover:bg-cta-hover disabled:opacity-50"
            >
              {isPending ? "전송 중..." : "보내기"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
