import { test, expect } from "@playwright/test";

test("anonymous visitor can like and unlike a sentence, count reverts", async ({
  page,
}) => {
  await page.goto("/");

  const firstCard = page.locator("article").first();
  await expect(firstCard).toBeVisible();

  const likeButton = firstCard.getByRole("button", { name: /좋아요/ });
  const countText = await likeButton.innerText();
  const initialCount = Number(countText.replace(/\D/g, ""));

  await likeButton.click();
  await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  await expect(likeButton).toContainText(String(initialCount + 1));

  await likeButton.click();
  await expect(likeButton).toHaveAttribute("aria-pressed", "false");
  await expect(likeButton).toContainText(String(initialCount));
});
