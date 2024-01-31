import { Hono } from "hono";

/** Middlewares */
import { logger, serveStatic, getSignedCookie, setSignedCookie } from "hono/middleware";

import { verify } from "https://deno.land/x/hono@v3.12.8/utils/jwt/jwt.ts";

import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { noRobots } from "~/middleware/no-robots.js";
import { auth } from "~/middleware/auth.js";
import { sessionMiddleware } from "~/middleware/session.js";
import { CookieStore } from "hono_sessions";

/** Jobs */
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";

/** Utils */
import { invariant } from "~/utils/invariant.js";

/* Routes that access KV store */
import { get as getFeedRoute } from "~/routes/feed.xml.js";
import { get as getIndexRoute } from "~/routes/index.js";
import { get as getBlogPostRoute } from "~/routes/blog.[slug].js";
import { get as getBlogIndexRoute } from "~/routes/blog.index.js";
import { get as getPageRoute } from "~/routes/[page].js";

import { Pages } from "~/models/pages.js";
import { Posts } from "~/models/posts.js";

const ENV = Deno.env.get("ENV");
const LOGIN_PATH = Deno.env.get("LOGIN_PATH");
const SITE_URL = Deno.env.get("SITE_URL");
const SESSION_KEY = Deno.env.get("SESSION_KEY");
const SUPER_SECRET_CACHE_PURGE_ROUTE = Deno.env.get("SUPER_SECRET_CACHE_PURGE_ROUTE");

invariant(LOGIN_PATH);
invariant(SITE_URL);
invariant(SESSION_KEY);

kv.listenQueue(async (message) => {
	switch (message.action) {
		case "process-webmention": {
			await processWebmention(message.payload);
			break;
		}
		case undefined:
			throw "undefined action";
		default:
			throw `unknown action: ${message.action}`;
	}
});

const app = new Hono();
const pages = new Pages();
const posts = new Posts();

app.use(
	"*",
	async (c, next) => {
		c.set("pages", pages);
		c.set("posts", posts);

		await next();

		if (![SUPER_SECRET_CACHE_PURGE_ROUTE, "/favicon.ico", "/main.css"].includes(c.req.path)) {
			queueMicrotask(() => {
				// TODO: pages.hasList isn’t a thing lol
				if (!posts.hasList) {
					console.log("Updating posts cache from isolates");
					posts.channel.postMessage({ action: "connected" });
				}
				if (!pages.hasList) {
					console.log("Updating pages cache from isolates");
					pages.channel.postMessage({ action: "connected" });
				}
			});
		}
	},
	// Feature flags
	async (c, next) => {
		const token = await getSignedCookie(c, SESSION_KEY, "flags");
		const flags = new Set(token ? await verify(token, SESSION_KEY) : []);

		c.set("flags", flags);

		await next();
	},
	pugRenderer(),
	logger(),
	async (c, next) => {
		const referer = c.req.header("referer");
		if (referer) console.log("Referer:", referer);
		await next();
	},
	rewriteWithoutTrailingSlashes(),
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

app.get(SUPER_SECRET_CACHE_PURGE_ROUTE, noRobots(), (c) => {
	const { searchParams } = new URL(c.req.url);

	if (searchParams.has("all")) {
		c.get("pages").purgeCache();
		c.get("posts").purgeCache();

		c.get("pages").channel.postMessage({ action: "purge" });
		c.get("posts").channel.postMessage({ action: "purge" });

		return c.text("purged entire cache");
	}

	if (searchParams.has("page")) {
		const pagesToEvict = searchParams.getAll("page");
		for (const page of pagesToEvict) c.get("pages").evict(page);
		c.get("pages").channel.postMessage({ action: "evict", payload: pagesToEvict });
		console.log(`evicted pages: ${pagesToEvict.join(", ")}`);
	}

	if (searchParams.has("post")) {
		const postsToEvict = searchParams.getAll("post");
		for (const post of postsToEvict) c.get("posts").evict(post);
		c.get("posts").channel.postMessage({ action: "evict", payload: postsToEvict });
		console.log(`evicted posts: ${postsToEvict.join(", ")}`);
	}

	return c.text("evicted specified pages and posts from the cache");
});

/**
 * PUBLIC ROUTES
 */

app.get("/feed.xml", getFeedRoute);
app.get("/", getIndexRoute);
app.get("/blog", getBlogIndexRoute);
app.get("/blog/:slug", getBlogPostRoute);

app.use("/webmention", sessionMiddleware({
	store: new CookieStore(),
	sessionCookieName: "__webmention_session",
	expireAfterSeconds: 60 * 60 * 24 * 7,
	encryptionKey: SESSION_KEY,
	cookieOptions: {
		path: "/webmention",
		domain: new URL(SITE_URL).hostname,
		httpOnly: true,
		secure: true,
		sameSite: "Strict",
	},
}));
app.get("/webmention", async (...args) => {
	const { get } = await import("~/routes/webmention.js");
	return get(...args);
});
app.post("/webmention", async (...args) => {
	const { post } = await import("~/routes/webmention.js");
	return post(...args);
});

if (ENV === "development") {
	app.use("/flags", sessionMiddleware({
		store: new CookieStore(),
		sessionCookieName: "__flags_session",
		expireAfterSeconds: 60 * 60 * 24 * 7,
		encryptionKey: SESSION_KEY,
		cookieOptions: {
			path: "/flags",
			domain: new URL(SITE_URL).hostname,
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
		},
	}));
	app.get("/flags", async (...args) => {
		const { get } = await import("~/routes/flags.js");
		return get(...args);
	});
	app.post("/flags", async (...args) => {
		const { post } = await import("~/routes/flags.js");
		return post(...args);
	});
}

app.get("/demos/:slug", async (...args) => {
	const { get } = await import ("~/routes/demos.[slug].js");
	return get(...args);
});

/**
 * PATTERNS
 */
const { patterns } = await import("~/routes/patterns.js");
app.route("/patterns", patterns);

/**
 * LOGIN & SUDO ROUTES
 */
app
	.use(`/${LOGIN_PATH}`, auth, noRobots(), async (c, next) => {
		const session = c.get("__auth_session");
		if (session.get("authorized") === true) return c.redirect("/sudo");
		await next();
	})
	.get(async (...args) => {
		const { get } = await import("~/routes/login.js");
		return get(...args);
	})
	.post(async (...args) => {
		const { post } = await import("~/routes/login.js");
		return post(...args);
	});

const { sudo } = await import("~/routes/sudo.js");
app.route("/sudo", sudo);

/* Page and static asset routes */
app.get("/:page{[a-z0-9-]+}", getPageRoute);

app.use("*", serveStatic({ root: "./assets" }));

Deno.serve({ port: ENV === "production" ? 8000 : 3000 }, app.fetch);
