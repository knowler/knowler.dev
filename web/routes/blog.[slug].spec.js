import { expect, test } from "@playwright/test";

test("blog post is present", async ({ page }) => {
	await page.goto("/blog/hello-world");
	await expect(page.getByRole("heading", { name: "Hello, World!" })).toBeVisible();
});
