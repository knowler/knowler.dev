import { Hono } from "hono";

/** Middlewares */
import { logger, serveStatic } from "hono/middleware";
import { CookieStore, sessionMiddleware } from "hono_sessions";
import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { noRobots } from "~/middleware/no-robots.js";
import { cache } from "~/middleware/cache.js";

/** Jobs */
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";

/** Utils */
import { invariant } from "~/utils/invariant.js";

/** Migration runner */
import { runMigrations } from "~/migrations.js";

const SITE_URL = Deno.env.get("SITE_URL");
const LOGIN_PATH = Deno.env.get("LOGIN_PATH");

invariant(SITE_URL);
invariant(LOGIN_PATH);

await runMigrations();

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
const sudo = new Hono();

const s = sessionMiddleware({
	store: new CookieStore(),
	sessionCookieName: "__session",
	expireAfterSeconds: 60 * 60 * 24 * 7,
	encryptionKey: Deno.env.get("SESSION_KEY"),
	cookieOptions: {
		path: "/",
		domain: new URL(SITE_URL).hostname,
		httpOnly: true,
		secure: false,
		sameSite: "Lax",
	},
});

app.use(
	"*",
	pugRenderer(),
	logger(),
	cache(),
	serveStatic({ root: "./assets" }),
	rewriteWithoutTrailingSlashes(),
);

app.notFound(async (...args) => {
	const { get } = await import("~/routes/404.js");
	return get(...args);
});

/**
 * PUBLIC ROUTES
 */

app.get("/feed.xml", async (...args) => {
	const { get } = await import("~/routes/feed.xml.js");
	return get(...args);
});

app.get("/", async (...args) => {
	const { get } = await import("~/routes/index.js");
	return get(...args);
});
app.get("/:page", async (...args) => {
	const { get } = await import("~/routes/[page].js");
	return get(...args);
});
app.get("/blog", async (...args) => {
	const { get } = await import("~/routes/blog.index.js");
	return get(...args);
});
app.get("/blog/:slug", async (...args) => {
	const { get } = await import("~/routes/blog.[slug].js");
	return get(...args);
});

app.use("/webmention", s);
app.get("/webmention", async (...args) => {
	const { get } = await import("~/routes/webmention.js");
	return get(...args);
});
app.post("/webmention", async (...args) => {
	const { post } = await import("~/routes/webmention.js");
	return post(...args);
});

/**
 * PATTERNS
 */
app.get("/patterns", async (...args) => {
	const { get } = await import("~/routes/patterns/index.js");
	return get(...args);
});

/**
 * LOGIN ROUTE
 */
app
	.use(`/${LOGIN_PATH}`, s, noRobots(), async (c, next) => {
		const session = c.get("session");
		if (session.get("authorized") === true) return c.redirect("/sudo");
		await next();
	})
	.get(async () => {
		const { get } = await import("~/routes/login.js");
		return get(...arguments);
	})
	.post(async () => {
		const { post } = await import("~/routes/login.js");
		return post(...arguments);
	});

/**
 * SUDO ROUTES
 */
sudo.use("*", s, noRobots());
sudo.use("*", async (c, next) => {
	const session = c.get("session");
	// Intentionally do not expose the login URL
	if (session.get("authorized") !== true) return c.notFound();
	await next();
});
sudo.get("/", async (...args) => {
	const { get } = await import("~/routes/sudo/index.js");
	return get(...args);
});
sudo.get("/content/:collectionType", async (...args) => {
	const { get } = await import(
		"~/routes/sudo/content.[collectionType].index.js"
	);
	return get(...args);
});
sudo.get("/content/:collectionType/new", (c) => {
	const { collectionType } = c.req.param();
	return c.text(`new ${collectionType}`);
});
sudo.get(
	"/content/:collectionType/:itemId",
	async (...args) => {
		const { get } = await import(
			"~/routes/sudo/content.[collectionType].[itemId].js"
		);
		return get(...args);
	},
);
sudo.get("/webmentions", async (...args) => {
	const { get } = await import("~/routes/sudo/webmentions.index.js");
	return get(...args);
});
sudo.post("/webmentions", async (...args) => {
	const { post } = await import("~/routes/sudo/webmentions.index.js");
	return post(...args);
});
sudo.get("/exit", (c) => {
	const session = c.get("session");
	session.set("authorized", false);
	return c.redirect(`/${LOGIN_PATH}`);
});

app.route("/sudo", sudo);

Deno.serve(app.fetch);
