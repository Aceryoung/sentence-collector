import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("allows an internal path", () => {
    expect(safeNextPath("/settings")).toBe("/settings");
  });

  it("allows an internal path with a query string", () => {
    expect(safeNextPath("/my?tab=liked")).toBe("/my?tab=liked");
  });

  it("falls back to root when missing", () => {
    expect(safeNextPath(null)).toBe("/");
  });

  it("falls back to root for an empty string", () => {
    expect(safeNextPath("")).toBe("/");
  });

  // 프로토콜 상대 URL — "/"로 시작한다고 통과시키면 외부로 튕겨나간다.
  it("rejects a protocol-relative URL", () => {
    expect(safeNextPath("//evil.com")).toBe("/");
  });

  it("rejects a protocol-relative URL with a path", () => {
    expect(safeNextPath("//evil.com/steal")).toBe("/");
  });

  it("rejects an absolute http URL", () => {
    expect(safeNextPath("https://evil.com")).toBe("/");
  });

  it("rejects a path not starting with a slash", () => {
    expect(safeNextPath("settings")).toBe("/");
  });

  it("rejects a backslash-prefixed path some browsers normalize to //", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/");
  });

  it("rejects a javascript: scheme", () => {
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
  });
});
