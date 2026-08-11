"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import { resolveLikeOutcome, toggleLikeState, type LikeState } from "@/lib/likes";

type Props = {
  sentenceId: string;
  initialCount: number;
};

export function LikeButton({ sentenceId, initialCount }: Props) {
  const [state, setState] = useState<LikeState>({
    liked: false,
    count: initialCount,
  });
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    const original = state;
    const action = original.liked ? "unlike" : "like";
    setState(toggleLikeState(original));

    const supabase = createClient();
    const deviceId = getDeviceId();

    const { error: dbError } =
      action === "like"
        ? await supabase
            .from("likes")
            .insert({ sentence_id: sentenceId, device_id: deviceId })
        : await supabase
            .from("likes")
            .delete()
            .eq("sentence_id", sentenceId)
            .eq("device_id", deviceId);

    const resolved = resolveLikeOutcome(
      original,
      action,
      dbError ? { code: dbError.code } : null,
    );
    setState(resolved);

    const isDuplicateLike = action === "like" && dbError?.code === "23505";
    if (dbError && !isDuplicateLike) {
      setError("좋아요 반영에 실패했어요.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={state.liked}
        aria-label={state.liked ? "좋아요 취소" : "좋아요"}
        className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-sm text-stone tabular-nums hover:text-ink"
      >
        <span aria-hidden="true">{state.liked ? "♥" : "♡"}</span>
        {state.count.toLocaleString("ko-KR")}
      </button>
      {error ? <p className="text-xs text-archive">{error}</p> : null}
    </div>
  );
}
