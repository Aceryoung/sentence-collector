import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  validatePassword,
  validateSentenceBody,
  validateSource,
  validateCommentary,
  validateEmotionTag,
} from "./validation";

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

describe("validatePassword", () => {
  it("accepts a password at the minimum length", () => {
    expect(validatePassword("abcdefgh")).toBeNull();
  });

  it("accepts a long password", () => {
    expect(validatePassword("글적에서쓰는아주아주긴비밀번호")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(validatePassword("")).toBe("비밀번호를 입력해주세요.");
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(validatePassword("abcdefg")).toBe(
      "비밀번호는 8자 이상으로 입력해주세요.",
    );
  });

  // 앞뒤 공백을 지우지 않는다 — 비밀번호는 공백도 유효한 문자다.
  it("counts surrounding whitespace as part of the password", () => {
    expect(validatePassword("  abcdef  ")).toBeNull();
  });

  it("rejects whitespace-only input shorter than the minimum", () => {
    expect(validatePassword("       ")).toBe(
      "비밀번호는 8자 이상으로 입력해주세요.",
    );
  });
});

describe("validateCommentary", () => {
  it("accepts an empty string (optional field)", () => {
    expect(validateCommentary("")).toBeNull();
  });

  it("accepts whitespace-only input (treated as empty)", () => {
    expect(validateCommentary("   ")).toBeNull();
  });

  it("rejects commentary shorter than 10 characters", () => {
    expect(validateCommentary("짧은감상")).toBe(
      "감상은 10자 이상 입력해주세요.",
    );
  });

  it("accepts commentary at exactly 10 characters", () => {
    expect(validateCommentary("가".repeat(10))).toBeNull();
  });

  it("accepts a normal commentary", () => {
    expect(
      validateCommentary("이 문장은 삶에서 선택의 순간마다 떠오르는 말이다."),
    ).toBeNull();
  });

  it("rejects commentary longer than 500 characters", () => {
    expect(validateCommentary("가".repeat(501))).toBe(
      "감상은 500자 이내로 입력해주세요.",
    );
  });

  it("accepts commentary at exactly 500 characters", () => {
    expect(validateCommentary("가".repeat(500))).toBeNull();
  });
});

describe("validateEmotionTag", () => {
  it("rejects an empty string", () => {
    expect(validateEmotionTag("")).toBe("감정 태그를 선택해주세요.");
  });

  it("accepts a valid emotion tag", () => {
    expect(validateEmotionTag("위로")).toBeNull();
    expect(validateEmotionTag("동기부여")).toBeNull();
    expect(validateEmotionTag("성찰")).toBeNull();
  });

  it("accepts a custom tag", () => {
    expect(validateEmotionTag("분노")).toBeNull();
    expect(validateEmotionTag("평온")).toBeNull();
  });

  it("rejects a tag longer than 20 characters", () => {
    expect(validateEmotionTag("a".repeat(21))).toBe("태그는 20자 이내로 입력해주세요.");
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
