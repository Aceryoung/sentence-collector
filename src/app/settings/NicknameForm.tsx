"use client";

import { useActionState, useState } from "react";
import { updateNickname, type NicknameState } from "./actions";

const initialState: NicknameState = { error: null, success: false };

type Props = {
  currentNickname: string | null;
};

export function NicknameForm({ currentNickname }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateNickname,
    initialState,
  );
  const [value, setValue] = useState(currentNickname ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wide text-stone">
          닉네임
        </span>
        <input
          type="text"
          name="nickname"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          placeholder="닉네임을 입력하세요"
          className="rounded-[var(--radius-input)] border border-hairline-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus-visible:border-cta focus-visible:shadow-[0_0_0_1px_var(--cta)]"
        />
        <span className="self-end text-[10px] tabular-nums text-stone-faint">
          {value.length}/20
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-[var(--radius-pill)] bg-cta px-4 py-2 text-xs font-bold text-cta-contrast transition-colors hover:bg-cta-hover disabled:opacity-60"
      >
        {isPending ? "저장 중…" : "닉네임 저장"}
      </button>

      {state.error ? (
        <p className="text-xs text-coral">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-archive">닉네임이 저장되었어요.</p>
      ) : null}
    </form>
  );
}
