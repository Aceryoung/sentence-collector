"use client";

import { useTransition } from "react";
import { resolveFeedback } from "./actions";

type FeedbackItem = {
  id: string;
  category: string;
  body: string;
  page_url: string | null;
  created_at: string;
  resolved: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  bug: "버그",
  suggestion: "제안",
  general: "기타",
};

export function AdminFeedbackList({ items }: { items: FeedbackItem[] }) {
  const [isPending, startTransition] = useTransition();

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveFeedback(id);
    });
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone">
        아직 접수된 피드백이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-[var(--radius-card)] border px-5 py-4 ${
            item.resolved
              ? "border-hairline bg-paper opacity-60"
              : "border-hairline bg-surface"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold">
              {CATEGORY_LABEL[item.category] ?? item.category}
            </span>
            <div className="flex items-center gap-2">
              <time className="text-xs text-stone-faint">
                {new Date(item.created_at).toLocaleDateString("ko-KR")}
              </time>
              {item.resolved ? (
                <span className="rounded-[var(--radius-pill)] bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                  해결됨
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleResolve(item.id)}
                  className="rounded-[var(--radius-pill)] border border-hairline-strong px-2 py-0.5 text-[10px] text-stone hover:text-ink"
                >
                  해결 처리
                </button>
              )}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-ink">{item.body}</p>
          {item.page_url ? (
            <p className="mt-1 truncate text-[10px] text-stone-faint">
              {item.page_url}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
