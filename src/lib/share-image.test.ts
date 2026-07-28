import { describe, expect, it } from "vitest";
import { computeCardHeight, wrapText } from "./share-image";

// 10px per character로 가정하는 가짜 measureText — 실제 Canvas 없이 줄바꿈 로직만 검증
const CHAR_WIDTH = 10;
const measureText = (text: string) => text.length * CHAR_WIDTH;

describe("wrapText", () => {
  it("keeps short text on a single line", () => {
    expect(wrapText("짧은 문장", 200, measureText)).toEqual(["짧은 문장"]);
  });

  it("wraps long text into multiple lines that each fit maxWidth", () => {
    const longText = "가".repeat(50);
    const maxWidth = 100; // 10글자만큼의 폭
    const lines = wrapText(longText, maxWidth, measureText);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe(longText);
    for (const line of lines) {
      expect(measureText(line)).toBeLessThanOrEqual(maxWidth);
    }
  });

  it("preserves explicit line breaks as separate lines", () => {
    const lines = wrapText("첫줄\n둘째줄", 500, measureText);
    expect(lines).toEqual(["첫줄", "둘째줄"]);
  });

  it("does not drop any characters for very long single-run text", () => {
    const longText = "나".repeat(501); // 등록 가능한 최대 길이보다 긴 극단값
    const lines = wrapText(longText, 80, measureText);
    expect(lines.join("")).toBe(longText);
  });

  it("returns a single empty line for empty input", () => {
    expect(wrapText("", 200, measureText)).toEqual([""]);
  });
});

describe("computeCardHeight", () => {
  it("increases by a fixed amount per additional line", () => {
    const h0 = computeCardHeight(1, false);
    const h1 = computeCardHeight(2, false);
    const h2 = computeCardHeight(3, false);
    expect(h1 - h0).toBe(h2 - h1);
    expect(h1 - h0).toBeGreaterThan(0);
  });

  it("adds a fixed amount of space when a source is present", () => {
    const withoutSource = computeCardHeight(3, false);
    const withSource = computeCardHeight(3, true);
    expect(withSource).toBeGreaterThan(withoutSource);

    const deltaAtThreeLines = withSource - withoutSource;
    const deltaAtFiveLines =
      computeCardHeight(5, true) - computeCardHeight(5, false);
    expect(deltaAtThreeLines).toBe(deltaAtFiveLines);
  });
});
