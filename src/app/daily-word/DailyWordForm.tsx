"use client";

import { useState, useTransition } from "react";
import { submitDailyWordResponse } from "./actions";
import { useToast } from "@/components/Toast";

type Props = {
  dailyWordId: string;
  existingResponse?: string | null;
};

export function DailyWordForm({ dailyWordId, existingResponse }: Props) {
  const [body, setBody] = useState(existingResponse ?? "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitDailyWordResponse(dailyWordId, body);
      if (result.error) {
        toast(result.error, "error");
      } else {
        toast(existingResponse ? "수정되었습니다." : "생각이 기록되었습니다.", "success");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="이 단어에서 떠오르는 생각을 자유롭게 적어보세요..."
        rows={4}
        maxLength={1000}
        className="w-full resize-none rounded-[var(--radius-card)] border border-hairline bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-stone-faint focus:border-archive focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs tabular-nums text-stone-faint">
          {body.length} / 1,000
        </span>
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-xs font-bold text-cta-contrast transition-all hover:bg-cta-hover disabled:opacity-50"
        >
          {isPending ? "저장 중..." : existingResponse ? "수정하기" : "기록하기"}
        </button>
      </div>
    </form>
  );
}
