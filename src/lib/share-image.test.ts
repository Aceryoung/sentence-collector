import { describe, expect, it } from "vitest";
import {
  CANVAS_WIDTH,
  computeCardHeight,
  computeSignatureLayout,
  wrapText,
} from "./share-image";

// 10px per character로 가정하는 가짜 measureText — 실제 Canvas 없이 줄바꿈 로직만 검증
const CHAR_WIDTH = 10;
const measureText = (text: string) => text.length * CHAR_WIDTH;

describe("wrapText", () => {
  it("keeps short text on a single line", () => {
    expect(wrapText("짧은 문장", 200, measureText)).toEqual(["짧은 문장"]);
  });

  it("wraps at word boundaries (spaces)", () => {
    // 6 words: "인생은 짧고 예술은 길다 그러니 즐기자"
    // Each word ~3 chars = 30px, space = 10px
    // maxWidth = 100 → fits ~10 chars → about 2 words + space per line
    const text = "인생은 짧고 예술은 길다 그러니 즐기자";
    const lines = wrapText(text, 100, measureText);

    expect(lines.length).toBeGreaterThan(1);
    // Verify no line breaks mid-word: rejoin should match original
    expect(lines.join(" ")).toBe(text);
    for (const line of lines) {
      expect(measureText(line)).toBeLessThanOrEqual(100);
    }
  });

  it("falls back to character wrap for a single long word without spaces", () => {
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

describe("computeSignatureLayout", () => {
  const CASES = [
    [1, false],
    [3, false],
    [3, true],
    [12, true],
  ] as const;

  it("keeps the signature inside the card for every content size", () => {
    for (const [lines, hasSource] of CASES) {
      const height = computeCardHeight(lines, hasSource);
      const sig = computeSignatureLayout(lines, hasSource);
      // 카드 안쪽 면(24px 인셋)을 넘지 않아야 한다.
      expect(sig.top + sig.height).toBeLessThanOrEqual(height - 24);
      expect(sig.right).toBeLessThanOrEqual(CANVAS_WIDTH - 24);
    }
  });

  it("never overlaps the source tag", () => {
    const withSource = computeSignatureLayout(3, true);
    const withoutSource = computeSignatureLayout(3, false);
    expect(withSource.top).toBeGreaterThan(withoutSource.top);
  });

  it("moves down as the body grows", () => {
    expect(computeSignatureLayout(6, false).top).toBeGreaterThan(
      computeSignatureLayout(3, false).top,
    );
  });
});
