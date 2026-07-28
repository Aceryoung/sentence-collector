import { describe, expect, it } from "vitest";
import { pickDailyId, pickDailyIndex } from "./daily-pick";

describe("pickDailyIndex", () => {
  it("returns null when there are no items", () => {
    expect(pickDailyIndex(0, new Date("2026-07-28T00:00:00Z"))).toBeNull();
  });

  it("is deterministic across multiple visits on the same day", () => {
    const morning = pickDailyIndex(5, new Date("2026-07-28T01:00:00Z"));
    const night = pickDailyIndex(5, new Date("2026-07-28T23:00:00Z"));
    expect(morning).toBe(night);
  });

  it("wraps back to the same index after exactly `length` days", () => {
    const day0 = pickDailyIndex(7, new Date("2026-07-28T00:00:00Z"));
    const day7 = pickDailyIndex(7, new Date("2026-08-04T00:00:00Z"));
    expect(day7).toBe(day0);
  });

  it("stays within [0, length) for various list sizes", () => {
    for (let length = 1; length <= 10; length++) {
      const index = pickDailyIndex(length, new Date("2026-07-28T12:00:00Z"));
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(length);
    }
  });
});

describe("pickDailyId", () => {
  it("returns null for an empty list", () => {
    expect(pickDailyId([], new Date("2026-07-28T00:00:00Z"))).toBeNull();
  });

  it("returns one of the ids in the list", () => {
    const ids = ["a", "b", "c"];
    const picked = pickDailyId(ids, new Date("2026-07-28T00:00:00Z"));
    expect(ids).toContain(picked);
  });

  it("returns the same id for repeated calls on the same day", () => {
    const ids = ["a", "b", "c", "d"];
    const first = pickDailyId(ids, new Date("2026-07-28T02:00:00Z"));
    const second = pickDailyId(ids, new Date("2026-07-28T20:00:00Z"));
    expect(first).toBe(second);
  });
});
