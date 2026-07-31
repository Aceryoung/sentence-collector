import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("returns 0 when there are no logs", () => {
    expect(computeStreak([], "2026-07-31")).toBe(0);
  });

  it("returns 1 when only today is logged", () => {
    expect(computeStreak(["2026-07-31"], "2026-07-31")).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const dates = ["2026-07-29", "2026-07-30", "2026-07-31"];
    expect(computeStreak(dates, "2026-07-31")).toBe(3);
  });

  it("keeps the streak alive on a grace day when yesterday was logged but today is not yet", () => {
    const dates = ["2026-07-29", "2026-07-30"];
    expect(computeStreak(dates, "2026-07-31")).toBe(2);
  });

  it("resets to 0 when both today and yesterday are missing", () => {
    const dates = ["2026-07-28"];
    expect(computeStreak(dates, "2026-07-31")).toBe(0);
  });

  it("only counts the most recent contiguous run when there is a gap", () => {
    const dates = ["2026-07-20", "2026-07-30", "2026-07-31"];
    expect(computeStreak(dates, "2026-07-31")).toBe(2);
  });

  it("ignores duplicate dates in the log", () => {
    const dates = ["2026-07-31", "2026-07-31"];
    expect(computeStreak(dates, "2026-07-31")).toBe(1);
  });
});
