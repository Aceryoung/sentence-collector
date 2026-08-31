"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFollow } from "./follow-actions";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] =
    useOptimistic(initialFollowing);

  function handleClick() {
    const nextAction = optimisticFollowing ? "unfollow" : "follow";
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      await toggleFollow(targetUserId, nextAction);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`btn-press min-h-11 rounded-[var(--radius-pill)] px-5 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${
        optimisticFollowing
          ? "border border-hairline-strong bg-surface text-stone hover:text-coral"
          : "bg-cta text-cta-contrast hover:bg-cta-hover"
      }`}
    >
      {optimisticFollowing ? "팔로잉" : "팔로우"}
    </button>
  );
}
