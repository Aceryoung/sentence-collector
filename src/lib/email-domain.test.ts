import { describe, expect, it } from "vitest";
import { DIRECT_INPUT, EMAIL_DOMAINS, composeEmail } from "./email-domain";

describe("composeEmail", () => {
  it("joins the local part and the domain", () => {
    expect(composeEmail("reader", "gmail.com")).toBe("reader@gmail.com");
  });

  it("trims whitespace from both sides", () => {
    expect(composeEmail("  reader ", " gmail.com ")).toBe("reader@gmail.com");
  });

  // 입력칸이 둘로 나뉘어 있어도 습관적으로 @를 같이 치는 사람이 있다.
  it("drops a stray @ typed at the end of the local part", () => {
    expect(composeEmail("reader@", "gmail.com")).toBe("reader@gmail.com");
  });

  it("drops a stray @ typed at the start of the domain", () => {
    expect(composeEmail("reader", "@gmail.com")).toBe("reader@gmail.com");
  });

  it("keeps only the first segment when a full address is pasted into the local field", () => {
    expect(composeEmail("reader@naver.com", "gmail.com")).toBe(
      "reader@gmail.com",
    );
  });

  // 비어 있어도 그대로 조합해서 이메일 검증이 잡게 둔다.
  it("still composes when the domain is empty", () => {
    expect(composeEmail("reader", "")).toBe("reader@");
  });

  it("still composes when the local part is empty", () => {
    expect(composeEmail("", "gmail.com")).toBe("@gmail.com");
  });
});

describe("EMAIL_DOMAINS", () => {
  it("offers a non-empty list", () => {
    expect(EMAIL_DOMAINS.length).toBeGreaterThan(0);
  });

  it("has no duplicates", () => {
    expect(new Set(EMAIL_DOMAINS).size).toBe(EMAIL_DOMAINS.length);
  });

  it("stores bare domains without the @ prefix", () => {
    expect(EMAIL_DOMAINS.every((domain) => !domain.startsWith("@"))).toBe(true);
  });

  // 드롭다운의 "직접입력"이 실제 도메인과 겹치면 선택 상태를 구분할 수 없다.
  it("does not collide with the direct-input sentinel", () => {
    expect(EMAIL_DOMAINS).not.toContain(DIRECT_INPUT);
  });
});
