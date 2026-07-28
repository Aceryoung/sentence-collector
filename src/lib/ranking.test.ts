import { describe, expect, it } from "vitest";
import { getPeriodStart, rankBySentenceLikes } from "./ranking";

describe("getPeriodStart", () => {
  it("returns 24 hours before now for day", () => {
    const now = new Date("2026-07-28T12:00:00Z");
    expect(getPeriodStart("day", now)).toEqual(
      new Date("2026-07-27T12:00:00Z"),
    );
  });

  it("returns 7 days before now for week", () => {
    const now = new Date("2026-07-28T00:00:00Z");
    expect(getPeriodStart("week", now)).toEqual(
      new Date("2026-07-21T00:00:00Z"),
    );
  });

  it("returns 30 days before now for month", () => {
    const now = new Date("2026-07-28T00:00:00Z");
    expect(getPeriodStart("month", now)).toEqual(
      new Date("2026-06-28T00:00:00Z"),
    );
  });
});

describe("rankBySentenceLikes", () => {
  it("returns an empty ranking when there are no likes in the period", () => {
    expect(rankBySentenceLikes([], new Map(), 10)).toEqual([]);
  });

  it("orders sentences by like count, descending", () => {
    const likes = [
      { sentenceId: "a" },
      { sentenceId: "a" },
      { sentenceId: "b" },
    ];
    expect(rankBySentenceLikes(likes, new Map(), 10)).toEqual([
      { sentenceId: "a", likeCount: 2 },
      { sentenceId: "b", likeCount: 1 },
    ]);
  });

  it("breaks ties by the sentence's most recent creation time", () => {
    const likes = [{ sentenceId: "old" }, { sentenceId: "new" }];
    const createdAt = new Map([
      ["old", "2026-01-01T00:00:00Z"],
      ["new", "2026-06-01T00:00:00Z"],
    ]);
    const result = rankBySentenceLikes(likes, createdAt, 10);
    expect(result.map((entry) => entry.sentenceId)).toEqual(["new", "old"]);
  });

  it("respects the limit", () => {
    const likes = [
      { sentenceId: "a" },
      { sentenceId: "b" },
      { sentenceId: "c" },
    ];
    expect(rankBySentenceLikes(likes, new Map(), 2)).toHaveLength(2);
  });
});
