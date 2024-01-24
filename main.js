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
import { pagesCache } from "./models/pages.js";
import { postsCache } from "./models/posts.js";

const ENV = Deno.env.get("ENV");
const LOGIN_PATH = Deno.env.get("LOGIN_PATH");
const SITE_URL = Deno.env.get("SITE_URL");
const SESSION_KEY = Deno.env.get("SESSION_KEY");

invariant(LOGIN_PATH);
invariant(SITE_URL);
invariant(SESSION_KEY);

const peersChannel = new BroadcastChannel("peers");

peersChannel.addEventListener("message", event => {
	const { action, payload } = event.data;
	switch (action) {
		case "ping":
			console.log(action, { elapsed: performance.now() - payload });
			peersChannel.postMessage({ action: "pong", payload: performance.now() });
			break;
		case "pong":
			console.log(action, { elapsed: performance.now() - payload });
			break;
	}
});

peersChannel.postMessage({ action: "ping", payload: performance.now() });

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

app.use(
	"*",
	pugRenderer(),
	logger(),
	async (c, next) => {
		const referer = c.req.header("referer");
		if (referer) console.log("Referer:", referer);
		await next();
	},
	// set-cookie filter: we only need cookies on pages with forms on them or if we have feature flags set
	//async (c, next) => {
	//	await next();

	//	if (new URLPattern({ pathname: "/sudo*" }).test({ pathname: c.req.path })) return;
	//	if (["/webmention", "/feature-flags", `/${LOGIN_PATH}`].includes(c.req.path)) return;

	//	const flags = c.get("__flags_session")?.get("flags");

	//	if (!flags) c.header("set-cookie", undefined);
	//},
	//sessionMiddleware({
	//	store: new CookieStore(),
	//	sessionCookieName: "__flags_session",
	//	expireAfterSeconds: 60 * 60 * 24 * 7,
	//	encryptionKey: SESSION_KEY,
	//	cookieOptions: {
	//		path: "/",
	//		domain: new URL(SITE_URL).hostname,
	//		httpOnly: true,
	//		secure: true,
	//		sameSite: "Strict",
	//	},
	//}),
	//async (c, next) => {
	//	if (new URLPattern({ pathname: "/sudo*" }).test({ pathname: c.req.path })) return;
	//	if (["/webmention", "/feature-flags", `/${LOGIN_PATH}`].includes(c.req.path)) return;

	//	const flags = c.get("__flags_session")?.get("flags");

	//	if (!flags) c.header("set-cookie", undefined);

	//	await next();
	//},
	//ENV === "development" ? (_, next) => next() : cache(),
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
app.get("/blog", async (...args) => {
	const { get } = await import("~/routes/blog.index.js");
	return get(...args);
});
app.get("/blog/:slug", async (...args) => {
	const { get } = await import("~/routes/blog.[slug].js");
	return get(...args);
});

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

app.get("/:page{[a-z0-9-]+}", async (...args) => {
	const { get } = await import("~/routes/[page].js");
	return get(...args);
});

app.use("*", serveStatic({ root: "./assets" }));

Deno.serve(app.fetch);
