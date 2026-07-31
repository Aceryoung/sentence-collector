import { describe, expect, it } from "vitest";
import { computeRecap } from "./recap";

const periodStart = new Date("2026-07-01T00:00:00Z");

describe("computeRecap", () => {
  it("returns all zeros/null when there is no activity", () => {
    expect(
      computeRecap({
        mySentenceCreatedAt: new Map(),
        likesInPeriod: [],
        periodStart,
      }),
    ).toEqual({ sentenceCountThisPeriod: 0, totalLikes: 0, topSentenceId: null });
  });

  it("counts only sentences created within the period", () => {
    const mySentenceCreatedAt = new Map([
      ["a", "2026-07-15T00:00:00Z"],
      ["b", "2026-06-15T00:00:00Z"],
    ]);
    const result = computeRecap({ mySentenceCreatedAt, likesInPeriod: [], periodStart });
    expect(result.sentenceCountThisPeriod).toBe(1);
  });

  it("counts likes received in the period even on sentences created before it", () => {
    const mySentenceCreatedAt = new Map([["old", "2026-06-01T00:00:00Z"]]);
    const likesInPeriod = [{ sentenceId: "old" }, { sentenceId: "old" }];
    const result = computeRecap({ mySentenceCreatedAt, likesInPeriod, periodStart });
    expect(result.totalLikes).toBe(2);
    expect(result.sentenceCountThisPeriod).toBe(0);
  });

  it("picks the sentence with the most likes as the top sentence", () => {
    const mySentenceCreatedAt = new Map([
      ["a", "2026-07-01T00:00:00Z"],
      ["b", "2026-07-02T00:00:00Z"],
    ]);
    const likesInPeriod = [
      { sentenceId: "a" },
      { sentenceId: "b" },
      { sentenceId: "b" },
    ];
    const result = computeRecap({ mySentenceCreatedAt, likesInPeriod, periodStart });
    expect(result.topSentenceId).toBe("b");
  });

  it("returns null topSentenceId when there are no likes", () => {
    const mySentenceCreatedAt = new Map([["a", "2026-07-01T00:00:00Z"]]);
    const result = computeRecap({ mySentenceCreatedAt, likesInPeriod: [], periodStart });
    expect(result.topSentenceId).toBeNull();
  });
});
