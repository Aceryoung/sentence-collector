import { test, expect } from "@playwright/test";

test("home page shows the practice link and either sentences or the empty state", async ({
  page,
}) => {
  await page.goto("/");

  const practiceLink = page.getByRole("link", { name: /오늘의 필사 보러가기/ });
  await expect(practiceLink).toBeVisible();
  await expect(practiceLink).toHaveAttribute("href", "/practice");

  const hasSentences = await page.locator("article").first().isVisible().catch(() => false);
  if (!hasSentences) {
    await expect(page.getByText("아직 등록된 문장이 없어요")).toBeVisible();
  }
});

test("clicking the practice link navigates to /practice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /오늘의 필사 보러가기/ }).click();
  await expect(page).toHaveURL(/\/practice$/);
  await expect(page.getByText("오늘의 필사")).toBeVisible();
});
