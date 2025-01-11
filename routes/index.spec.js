import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("title", async ({ page }) => {
	await expect(page).toHaveTitle(/Welcome/);
});
