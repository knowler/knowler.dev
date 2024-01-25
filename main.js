import { Hono } from "hono";

/** Middlewares */
import { logger, serveStatic } from "hono/middleware";
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
app.get("/admin", c => c.notFound());

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
	app.get("/feature-flags", async (...args) => {
		const { get } = await import("~/routes/feature-flags.js");
		return get(...args);
	});
	app.post("/feature-flags", async (...args) => {
		const { post } = await import("~/routes/feature-flags.js");
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
