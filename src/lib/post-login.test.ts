import { describe, expect, it } from "vitest";
import { resolvePostLoginPath } from "./post-login";

describe("resolvePostLoginPath", () => {
  it("sends a brand-new user to the password setup screen", () => {
    expect(resolvePostLoginPath({})).toBe("/settings?setup=1");
  });

  it("sends a user with no metadata at all to setup", () => {
    expect(resolvePostLoginPath(undefined)).toBe("/settings?setup=1");
  });

  it("sends a user who already set a password to the home feed", () => {
    expect(
      resolvePostLoginPath({ has_password: true, password_prompt_seen: true }),
    ).toBe("/");
  });

  // "나중에"를 누른 사람에게 매번 같은 화면을 들이밀지 않는다.
  it("respects a user who dismissed the prompt without setting one", () => {
    expect(resolvePostLoginPath({ password_prompt_seen: true })).toBe("/");
  });

  // 재설정 링크처럼 목적지가 이미 정해진 경우 안내가 끼어들면 안 된다.
  it("keeps an explicit destination even for a user without a password", () => {
    expect(resolvePostLoginPath({}, "/settings")).toBe("/settings");
  });

  it("keeps an explicit destination for a user who has a password", () => {
    expect(resolvePostLoginPath({ has_password: true }, "/my")).toBe("/my");
  });

  // 콜백의 기본값 "/"는 "명시적 목적지"가 아니라 목적지 없음으로 취급한다.
  it("treats a bare root destination as no destination", () => {
    expect(resolvePostLoginPath({}, "/")).toBe("/settings?setup=1");
  });
});
