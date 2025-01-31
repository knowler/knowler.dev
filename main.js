import { Hono } from "hono";

/** Middlewares */
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { cache as cacheMiddleware } from "hono/cache";

import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { noRobots } from "~/middleware/no-robots.js";

/** Utils */
import { invariant } from "~/utils/invariant.js";
import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";

import { Posts } from "~/models/posts.js";

const ENV = Deno.env.get("ENV");
const DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID") ?? Date.now();
const SITE_URL = Deno.env.get("SITE_URL");
const SUPER_SECRET_CACHE_PURGE_ROUTE = Deno.env.get("SUPER_SECRET_CACHE_PURGE_ROUTE");

invariant(SITE_URL);

const app = new Hono();

const kv = await Deno.openKv();

const { value: cache_versions } = await kv.get(["cache_versions"]);
Deno.env.set("CONTENT_VERSION", cache_versions.content_version);
Deno.env.set("DEMOS_VERSION", cache_versions.demos_version);

watchCacheVersions();

const contentCache = cacheMiddleware({
	cacheName: c => {
		const cacheName = `${DEPLOYMENT_ID}.${Deno.env.get("CONTENT_VERSION")}`;
		console.log(cacheName);
		return cacheName;
	},
	wait: true,
});

app.use(
	"*",
	async (c, next) => {
		c.set("kv", kv);

		const posts = new Posts(kv);

		c.set("posts", posts);

		await next();
	},
	pugRenderer(),
	logger(),
	async (c, next) => {
		const referer = c.req.header("referer");
		if (referer) console.log("Referer:", referer);
		console.log("user agent", c.req.header("User-Agent"));
		await next();
	},
	rewriteWithoutTrailingSlashes(),

	// CSS Naked Day
	async (c, next) => {
		if (isCSSNakedDay()) {
			c.res.headers.append("content-security-policy", "style-src 'none'");
		}
		await next();
	},
);

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
	"/sitemap.xml",
];
for (const ignoredRoute of ignoreList) app.get(ignoredRoute, c => c.notFound());

/**
 * PUBLIC ROUTES
 */

app.get("/feed.xml", contentCache);
app.get("/feed.xml", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/feed.xml.js");
	return get(...args);
});
app.get("/", contentCache);
app.get("/", async (...args) => {
	console.log("cache miss");
	const { get } = await import ("~/routes/index.js");
	return get(...args);
});
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
			Deno.env.set("CONTENT_VERSION", cache_versions.content_version);
			Deno.env.set("DEMOS_VERSION", cache_versions.demos_version);
		}
	}
}

