import { describe, expect, it } from "vitest";
import { isValidEmail, validateSentenceBody, validateSource } from "./validation";

describe("isValidEmail", () => {
  it("accepts a well-formed email", () => {
    expect(isValidEmail("reader@example.com")).toBe(true);
  });

  it("rejects an email missing @", () => {
    expect(isValidEmail("reader-example.com")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects whitespace-only input", () => {
    expect(isValidEmail("   ")).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  reader@example.com  ")).toBe(true);
  });

  it("rejects an email with no domain", () => {
    expect(isValidEmail("reader@")).toBe(false);
  });
});

describe("validateSentenceBody", () => {
  it("accepts a normal sentence", () => {
    expect(validateSentenceBody("완벽함보다는 정직함이 낫다.")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(validateSentenceBody("")).toBe("문장을 입력해주세요.");
  });

  it("rejects whitespace-only input", () => {
    expect(validateSentenceBody("   ")).toBe("문장을 입력해주세요.");
  });

  it("rejects a sentence longer than 500 characters", () => {
    expect(validateSentenceBody("가".repeat(501))).toBe(
      "문장은 500자 이내로 입력해주세요.",
    );
  });

  it("accepts a sentence exactly at the 500 character limit", () => {
    expect(validateSentenceBody("가".repeat(500))).toBeNull();
  });
});

describe("validateSource", () => {
  it("accepts an empty source (optional field)", () => {
    expect(validateSource("")).toBeNull();
  });

  it("accepts a normal source", () => {
    expect(validateSource("보르헤스")).toBeNull();
  });

  it("rejects a source longer than 200 characters", () => {
    expect(validateSource("가".repeat(201))).toBe(
      "출처는 200자 이내로 입력해주세요.",
    );
  });
});
