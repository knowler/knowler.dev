import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";

const minimal = new Hono();

minimal.use("*", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ root: "./experimental/minimal-templating" })(c, next);
	await next();
});

const pages = [
	"about",
	"blog",
	"uses",
	"accessibility",
	"privacy",
	"navigation",
	"colophon",
];

for (const page of pages) {
	minimal.get(`/${page}`, async (c, next) => {
		const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
		if (enabled) return serveStatic({ path: `./experimental/minimal-templating/${page}.html` })(c, next);
		await next();
	});
}

export { minimal };
