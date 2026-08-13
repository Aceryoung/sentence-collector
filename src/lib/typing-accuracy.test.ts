import { describe, expect, it } from "vitest";
import { calculateAccuracy } from "./typing-accuracy";

describe("calculateAccuracy", () => {
  it("returns 1 for identical strings", () => {
    expect(calculateAccuracy("hello", "hello")).toBe(1);
  });

  it("returns 1 for both empty", () => {
    expect(calculateAccuracy("", "")).toBe(1);
  });

  it("normalizes whitespace", () => {
    expect(calculateAccuracy("a  b   c", "a b c")).toBe(1);
  });

  it("counts character mismatches", () => {
    // "abcd" vs "abXd" → 3 matches out of 4
    expect(calculateAccuracy("abcd", "abXd")).toBe(0.75);
  });

  it("penalizes shorter input", () => {
    // "abcd" (4) vs "ab" (2) → 2 matches / 4 max = 0.5
    expect(calculateAccuracy("abcd", "ab")).toBe(0.5);
  });

  it("penalizes longer input", () => {
    // "ab" (2) vs "abcd" (4) → 2 matches / 4 max = 0.5
    expect(calculateAccuracy("ab", "abcd")).toBe(0.5);
  });

  it("handles Korean text", () => {
    const original = "진짜 여행은 새로운 풍경을 보는 것이다";
    const typed = "진짜 여행은 새로운 풍겨을 보는 것이다";
    // 1 char difference: 경→겨
    const acc = calculateAccuracy(original, typed);
    expect(acc).toBeGreaterThan(0.9);
    expect(acc).toBeLessThan(1);
  });
});
