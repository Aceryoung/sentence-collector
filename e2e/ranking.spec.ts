import { test, expect } from "@playwright/test";

test("ranking page switches between day/week/month periods", async ({ page }) => {
  await page.goto("/ranking");

  await expect(page.getByRole("heading", { name: "랭킹" })).toBeVisible();

  await page.getByRole("link", { name: "주간" }).click();
  await expect(page).toHaveURL(/period=week/);

  await page.getByRole("link", { name: "월간" }).click();
  await expect(page).toHaveURL(/period=month/);

  // 기간 날짜 범위 표시(YYYY.MM.DD - YYYY.MM.DD)
  await expect(page.getByText(/\d{4}\.\d{2}\.\d{2} - \d{4}\.\d{2}\.\d{2}/)).toBeVisible();
});
