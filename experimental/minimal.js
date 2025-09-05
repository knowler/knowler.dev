import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";

const minimal = new Hono();

minimal.use("*", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ root: "./experimental/minimal-templating" })(c, next);
	await next();
});

minimal.get("/about", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ path: "./experimental/minimal-templating/about.html" })(c, next);
	await next();
});

minimal.get("/blog", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ path: "./experimental/minimal-templating/blog.html" })(c, next);
	await next();
});

minimal.get("/colophon", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ path: "./experimental/minimal-templating/colophon.html" })(c, next);
	await next();
});

minimal.get("/navigation", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ path: "./experimental/minimal-templating/navigation.html" })(c, next);
	await next();
});

minimal.get("/uses", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ path: "./experimental/minimal-templating/uses.html" })(c, next);
	await next();
});

export { minimal };
