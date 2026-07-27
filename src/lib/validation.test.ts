import { describe, expect, it } from "vitest";
import { isValidEmail } from "./validation";

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
