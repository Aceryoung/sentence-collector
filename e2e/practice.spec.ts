import { test, expect } from "@playwright/test";

test("anonymous visitor can access /practice and is prompted to log in for streaks", async ({
  page,
}) => {
  await page.goto("/practice");

  await expect(page.getByText("오늘의 필사")).toBeVisible();
  await expect(
    page.getByText("로그인하면 필사 기록을 스트릭으로 남길 수 있어요"),
  ).toBeVisible();

  // 비회원에게는 완료 버튼이 보이면 안 됨
  await expect(page.getByRole("button", { name: "필사 완료로 표시" })).toHaveCount(0);
});
