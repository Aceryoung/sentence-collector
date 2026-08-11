"use client";

import { useActionState } from "react";
import { logPractice, type LogPracticeState } from "./actions";

const initialState: LogPracticeState = { error: null };

export function PracticeCompleteButton({ sentenceId }: { sentenceId: string }) {
  const [state, formAction, isPending] = useActionState(
    logPractice,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <input type="hidden" name="sentenceId" value={sentenceId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-[var(--radius-pill)] border-none bg-cta px-5 py-2.5 text-sm font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {isPending ? "기록하는 중…" : "필사 완료로 표시"}
      </button>
      {state.error ? (
        <p className="text-xs text-archive">{state.error}</p>
      ) : null}
    </form>
  );
}
