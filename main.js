import { Hono } from "hono";

/** Middlewares */
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { cache as cacheMiddleware } from "hono/cache";
import { trimTrailingSlash } from "hono/trailing-slash";
import { bearerAuth } from "hono/bearer-auth"
import { pugRenderer } from "~/middleware/pug-renderer.js";
import { cssNakedDay } from "~/middleware/css-naked-day.js";
import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";

import { minimal } from "~/experimental/minimal.js";

/** Utils */
import { invariant } from "~/utils/invariant.js";

import { getCookie, setCookie, deleteCookie } from "hono/cookie";

import { Posts } from "~/models/posts.js";

const ENV = Deno.env.get("ENV");
const DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID") ?? Date.now();
const SITE_URL = Deno.env.get("SITE_URL");

invariant(SITE_URL);

const app = new Hono();

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");

if (MIGRATION_PATH && MIGRATION_TOKEN) {
	app.use(`/${MIGRATION_PATH}`, bearerAuth({ token: MIGRATION_TOKEN }));
	app.post(`/${MIGRATION_PATH}`, async (c, next) => {
		const { key, value } = await c.req.json();

		await kv.set(key, value);

		return c.json({ key, message: "success" });
	});
}

const kv = await Deno.openKv();

const { value: cache_versions } = await kv.get(["cache_versions"]);
Deno.env.set("CONTENT_VERSION", cache_versions?.content_version);
Deno.env.set("DEMOS_VERSION", cache_versions?.demos_version);

watchCacheVersions();

const contentCache = cacheMiddleware({
	cacheName: c => {
		const minimal = getCookie(c, "minimal-templating-flag");
		let cacheName = `${DEPLOYMENT_ID}.${Deno.env.get("CONTENT_VERSION")}`;
		if (isCSSNakedDay()) cacheName = `${cacheName}.${new Date().getFullYear()}-css-naked-day`;
		if (minimal === "enabled") cacheName = `${cacheName}.minimal`;
		console.log(cacheName);
		return cacheName;
	},
	cacheControl: 'maxage=60, stale-while-revalidate=30',
	wait: true,
});

app.use(
	"*",
	async (c, next) => {
		c.set("kv", kv);
		c.set("posts", new Posts(kv));
		await next();
	},
	pugRenderer(),
	logger(log),
	async (c, next) => {
		const referer = c.req.header("referer");
		if (referer) log(`Referer: ${referer}`);
		log(`User agent: ${c.req.header("User-Agent")}`);
		await next();
	},
	trimTrailingSlash(),
	cssNakedDay(),
);

app.get("/toggle-minimal", (c) => {
	const cookie = getCookie(c, "minimal-templating-flag");

	if (cookie === "enabled") deleteCookie(c, "minimal-templating-flag");
	else setCookie(c, "minimal-templating-flag", "enabled");

	return c.redirect("/", 303);
});

app.route("/", minimal);

app.notFound(async (...args) => {
	const { get } = await import("~/routes/404.js");
	return get(...args);
});

/* Some common requests not to process */
const ignoreList = [
	"//:path{.+\/*}",
	"*.php",
	"/.env",
	"/.git",
	"/.git/*",
	"/admin",
	"/admin/*",
	"/web/*",
	"/wp/*",
	"/wp-admin/*",
	"/wp-content/*",
	"/wp-includes/*",
	"/cgi-bin/*",

	// TODO: cache bad URL requests like this so they don’t keep reading.
	"/blog/MjAyNC1jc3",
	"/blog/2024-css-wishlistW",

	// Might add these 
	"/contact",
];
for (const ignoredRoute of ignoreList) app.get(ignoredRoute, c => c.notFound());

/**
 * PUBLIC ROUTES
 */

app.get("/cv.pdf", async (c, next) => {
	await next();
	c.header("content-disposition", `attachment; filename="Nathan Knowler - CV.pdf"`);
});

app.get("/feed.xml", contentCache);
app.get("/feed.xml", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/feed.xml.js");
	return get(...args);
});
app.get("/sitemap.xml", contentCache);
app.get("/sitemap.xml", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/sitemap.xml.js");
	return get(...args);
});
app.get("/", contentCache);
app.get("/", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/index.js");
	return get(...args);
});
app.get("/blog", contentCache);
app.get("/blog", async (...args) => {
	const { get } = await import ("~/routes/blog.index.js");
	return get(...args);
});
app.get("/blog/:slug", contentCache);
app.get("/blog/:slug", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/blog.[slug].js");
	return get(...args);
});

/* ------------ START PAUSED ------------ */

app.get("/webmention", async (...args) => {
	const { get } = await import("~/routes/webmention.js");
	return get(...args);
});
app.get("/flags", async (...args) => {
	const { get } = await import("~/routes/flags.js");
	return get(...args);
});

/* ------------ END PAUSED ------------ */

app.get("/demos/*", async (c, next) => {
	c.res.headers.delete("content-security-policy");
	await next();
});

app.get("/demos/:slug", cacheMiddleware({
	cacheName: c => {
		const cacheName = `${DEPLOYMENT_ID}.demos.${Deno.env.get("DEMOS_VERSION")}`;
		console.log(cacheName);
		return cacheName;
	},
	wait: true,
}))
app.get("/demos/:slug", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/demos.[slug].js");
	return get(...args);
});

/* Page and static asset routes */
app.get("/:page{[a-z0-9-]+}", contentCache);
app.get("/:page{[a-z0-9-]+}", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/[page].js");
	return get(...args);
});
app.use(
	"*",
	cacheMiddleware({
		cacheName: `${DEPLOYMENT_ID}.assets`,
		wait: true,
	}),
);
app.use("*", serveStatic({ root: "./assets" }));

Deno.serve({ port: ENV === "production" ? 8000 : new URL(SITE_URL).port }, app.fetch);

async function watchCacheVersions() {
	for await (const entries of kv.watch([["cache_versions"]])) {
		for (const { value: cache_versions } of entries) {
			Deno.env.set("CONTENT_VERSION", cache_versions?.content_version);
			Deno.env.set("DEMOS_VERSION", cache_versions?.demos_version);
		}
	}
}

function log() { console.log(...arguments); }
