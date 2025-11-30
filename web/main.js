import { Hono } from "hono";

/** Middlewares */
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { cache as cacheMiddleware } from "hono/cache";
import { trimTrailingSlash } from "hono/trailing-slash";
import { bearerAuth } from "hono/bearer-auth";
import { uaBlocker } from "hono/ua-blocker";
import { aiBots, useAiRobotsTxt } from "hono/ua-blocker/ai-bots";

import { pugRenderer } from "~/middleware/pug-renderer.js";
import { cssNakedDay } from "~/middleware/css-naked-day.js";

/** Utils */
import { invariant } from "@knowler/shared/invariant";
import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";

import { Posts } from "~/models/posts.js";

import { api } from "@knowler/api";

console.log(Deno.env.get("DENO_DEPLOY_BUILD_ID"));

const ENV = Deno.env.get("ENV");
const DEPLOYMENT_ID = Deno.env.get("DENO_DEPLOYMENT_ID") ?? Date.now();
const SITE_URL = Deno.env.get("SITE_URL");

invariant(SITE_URL);

const app = new Hono();

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");

invariant(MIGRATION_PATH);

const kv = await Deno.openKv();

const { value: cache_versions } = await kv.get(["cache_versions"]);
Deno.env.set("CONTENT_VERSION", cache_versions?.content_version);
Deno.env.set("DEMOS_VERSION", cache_versions?.demos_version);

watchCacheVersions();

const contentCache = cacheMiddleware({
	cacheName: c => {
		let cacheName = `${DEPLOYMENT_ID}.${Deno.env.get("CONTENT_VERSION")}`;
		if (isCSSNakedDay()) cacheName = `${cacheName}.${new Date().getFullYear()}-css-naked-day`;
		console.log(cacheName);
		return cacheName;
	},
	cacheControl: "s-maxage=60, stale-while-revalidate=30",
	wait: true,
});

app.use(
	"*",
	uaBlocker({ blocklist: aiBots }),
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

app.get("/robots.txt", useAiRobotsTxt());

app.route(MIGRATION_PATH, api);

app.notFound(async (...args) => {
	const { get } = await import("~/routes/404.js");
	return get(...args);
});

for (const ignoredRoute of Deno.env.get("PATH_DENY_LIST").split(" "))
	app.get(ignoredRoute, c => c.notFound());


/**
 * DEMOS
 */

app.get("/demos/*", async (c, next) => {
	c.res.headers.delete("content-security-policy");
	await next();
});

const demosCache = cacheMiddleware({
	cacheName: c => {
		const cacheName = `${DEPLOYMENT_ID}.demos.${Deno.env.get("DEMOS_VERSION")}`;
		console.log(cacheName);
		return cacheName;
	},
	wait: true,
});

/**
 * PUBLIC ROUTES
 */

app.get("/cv.pdf", async (c, next) => {
	await next();
	c.header("content-disposition", `attachment; filename="Nathan Knowler - CV.pdf"`);
});

for (const [pattern, filename, cache] of [
	["/feed.xml", "feed.xml", contentCache],
	["/sitemap.xml", "sitemap.xml", contentCache],
	["/", "index", contentCache],
	["/blog", "blog.index", contentCache],
	["/blog/:slug", "blog.[slug]", contentCache],
	["/demos/:slug", "demos.[slug]", demosCache],
	["/:page{[a-z0-9-]+}", "[page]", contentCache],
	// Paused
	["/webmention", "webmention"],
	["/flags", "flags"],
]) {
	if (cache) app.get(pattern, cache);
	app.get(pattern, async (...args) => {
		console.log("cache miss");
		const { get } = await import (`~/routes/${filename}.js`);
		return get(...args);
	});
}

/** ASSETS */

app.use(
	"*",
	cacheMiddleware({
		cacheName: `${DEPLOYMENT_ID}.assets`,
		wait: true,
	}),
);

app.use(`*.${BUILD_ID}.*`, (c, next) => {
	c.header("cache-control", "max-age=31536000, immutable");
	next();
});

app.use("*", serveStatic({
	root: new URL(import.meta.resolve("./public")).pathname,
}));

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
