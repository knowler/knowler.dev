import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "routes",
	use: {
		baseURL: process.env.SITE_URL,
	},
	webServer: {
		command: "deno task dev",
		url: process.env.SITE_URL,
		reuseExistingServer: true,
	},
});
