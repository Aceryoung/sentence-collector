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
        className="border-none bg-archive px-4 py-2 font-mono text-sm text-archive-contrast disabled:opacity-60"
      >
        {isPending ? "기록하는 중…" : "필사 완료로 표시"}
      </button>
      {state.error ? (
        <p className="font-mono text-xs text-archive">{state.error}</p>
      ) : null}
    </form>
  );
}
