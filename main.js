import { Hono } from "hono";

/** Middlewares */
import { logger, serveStatic } from "hono/middleware";
import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { noRobots } from "~/middleware/no-robots.js";
import { cache } from "~/middleware/cache.js";
import { s } from "~/middleware/session.js";

/** Jobs */
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";

/** Utils */
import { invariant } from "~/utils/invariant.js";

const ENV = Deno.env.get("ENV");
const LOGIN_PATH = Deno.env.get("LOGIN_PATH");

invariant(LOGIN_PATH);

globalThis.addEventListener("unload", () => console.log("UNLOAD"));

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
	// set-cookie filter: we only need cookies on pages with forms on them or if we have feature flags set
	async (c, next) => {
		await next();

		if (["/webmention", "/feature-flags"].includes(c.req.path)) return;

		const flags = c.get("session")?.get("flags");

		if (!flags) c.header("set-cookie", undefined);
	},
	s,
	ENV === "development" ? (c, next) => next() : cache(),
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

/**
 * PATTERNS
 */
const { patterns } = await import("~/routes/patterns.js");
app.route("/patterns", patterns);

/**
 * LOGIN & SUDO ROUTES
 */
app
	.use(`/${LOGIN_PATH}`, s, noRobots(), async (c, next) => {
		const session = c.get("session");
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

Deno.serve(app.fetch);
