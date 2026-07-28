export type LikeState = {
  liked: boolean;
  count: number;
};

export type LikeAction = "like" | "unlike";

export function toggleLikeState(state: LikeState): LikeState {
  return state.liked
    ? { liked: false, count: Math.max(0, state.count - 1) }
    : { liked: true, count: state.count + 1 };
}

export function resolveLikeOutcome(
  original: LikeState,
  action: LikeAction,
  error: { code?: string } | null,
): LikeState {
  if (!error) return toggleLikeState(original);

  // 23505 = Postgres unique_violation. 이미 이 기기에서 좋아요한 문장이었다는 뜻이라
  // liked만 true로 보정하고, 낙관적으로 올렸던 count는 되돌린다.
  if (action === "like" && error.code === "23505") {
    return { liked: true, count: original.count };
  }

  return original;
}
