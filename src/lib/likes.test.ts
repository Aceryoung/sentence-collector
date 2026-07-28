import { describe, expect, it } from "vitest";
import { resolveLikeOutcome, toggleLikeState } from "./likes";

describe("toggleLikeState", () => {
  it("likes an unliked sentence, incrementing the count", () => {
    expect(toggleLikeState({ liked: false, count: 3 })).toEqual({
      liked: true,
      count: 4,
    });
  });

  it("unlikes a liked sentence, decrementing the count", () => {
    expect(toggleLikeState({ liked: true, count: 3 })).toEqual({
      liked: false,
      count: 2,
    });
  });

  it("never lets the count go below zero when unliking", () => {
    expect(toggleLikeState({ liked: true, count: 0 })).toEqual({
      liked: false,
      count: 0,
    });
  });

  it("round-trips back to the original state", () => {
    const original = { liked: false, count: 5 };
    const liked = toggleLikeState(original);
    expect(toggleLikeState(liked)).toEqual(original);
  });
});

describe("resolveLikeOutcome", () => {
  it("keeps the optimistic result when the request succeeds", () => {
    const original = { liked: false, count: 3 };
    expect(resolveLikeOutcome(original, "like", null)).toEqual({
      liked: true,
      count: 4,
    });
  });

  it("reverts to the original state when a like request fails", () => {
    const original = { liked: false, count: 3 };
    expect(
      resolveLikeOutcome(original, "like", { code: "500" }),
    ).toEqual(original);
  });

  it("reverts to the original state when an unlike request fails", () => {
    const original = { liked: true, count: 3 };
    expect(
      resolveLikeOutcome(original, "unlike", { code: "500" }),
    ).toEqual(original);
  });

  it("corrects to liked=true without double-counting on a duplicate like (same device already liked it)", () => {
    const original = { liked: false, count: 3 };
    expect(
      resolveLikeOutcome(original, "like", { code: "23505" }),
    ).toEqual({ liked: true, count: 3 });
  });
});
