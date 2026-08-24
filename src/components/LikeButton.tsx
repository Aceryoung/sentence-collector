"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import { resolveLikeOutcome, toggleLikeState, type LikeState } from "@/lib/likes";
import { useToast } from "@/components/Toast";

type Props = {
  sentenceId: string;
  initialCount: number;
};

export function LikeButton({ sentenceId, initialCount }: Props) {
  const [state, setState] = useState<LikeState>({
    liked: false,
    count: initialCount,
  });
  const { toast } = useToast();

  async function handleClick() {
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
      toast("좋아요 반영에 실패했어요.", "error");
    } else if (action === "like") {
      toast("좋아요를 눌렀어요");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={state.liked}
      aria-label={state.liked ? "좋아요 취소" : "좋아요"}
      className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-sm text-stone tabular-nums hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={state.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={state.liked ? "text-coral" : ""}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {state.count.toLocaleString("ko-KR")}
    </button>
  );
}
