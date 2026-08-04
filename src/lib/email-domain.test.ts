import { describe, expect, it } from "vitest";
import { EMAIL_DOMAINS, applyEmailDomain } from "./email-domain";

describe("applyEmailDomain", () => {
  it("appends the domain to a bare local part", () => {
    expect(applyEmailDomain("reader", "gmail.com")).toBe("reader@gmail.com");
  });

  it("completes an address that already ends with @", () => {
    expect(applyEmailDomain("reader@", "naver.com")).toBe("reader@naver.com");
  });

  // 도메인을 잘못 골랐을 때 지우고 다시 고르게 하지 않는다.
  it("replaces an existing domain", () => {
    expect(applyEmailDomain("reader@naver.com", "gmail.com")).toBe(
      "reader@gmail.com",
    );
  });

  it("replaces a partially typed domain", () => {
    expect(applyEmailDomain("reader@nav", "daum.net")).toBe("reader@daum.net");
  });

  it("trims surrounding whitespace from the local part", () => {
    expect(applyEmailDomain("  reader  ", "gmail.com")).toBe(
      "reader@gmail.com",
    );
  });

  // @가 여러 개면 첫 번째만 구분자로 본다.
  it("keeps only the text before the first @", () => {
    expect(applyEmailDomain("reader@a@b", "gmail.com")).toBe(
      "reader@gmail.com",
    );
  });

  it("still shows the domain when nothing has been typed yet", () => {
    expect(applyEmailDomain("", "gmail.com")).toBe("@gmail.com");
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
});
