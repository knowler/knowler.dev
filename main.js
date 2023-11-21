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

import { invariant } from "~/utils/invariant.js";
import { deferImportGet, deferImportPost } from "~/utils/import.ts";

/** Routes */
import { get as get404Route } from "~/routes/404.js";
import { get as getIndexRoute } from "~/routes/index.js";
import { get as getFeedRoute } from "~/routes/feed.xml.js";
import { get as getBlogIndexRoute } from "~/routes/blog.index.js";
import { get as getBlogPostRoute } from "~/routes/blog.[slug].js";
import { get as getPageRoute } from "~/routes/[page].js";
import {
	get as getWebmentionRoute,
	post as postWebmentionRoute,
} from "~/routes/webmention.js";
import {
	get as getLoginRoute,
	post as postLoginRoute,
} from "~/routes/login.js";
import { get as getSudoIndexRoute } from "~/routes/sudo/index.js";
import { get as getSudoContentCollectionTypeIndexRoute } from "~/routes/sudo/content.[collectionType].index.js";
import { get as getSudoContentCollectionTypeItemRoute } from "~/routes/sudo/content.[collectionType].[itemId].js";
import {
	get as getSudoWebmentionsIndexRoute,
	post as postSudoWebmentionsIndexRoute,
} from "~/routes/sudo/webmentions.index.js";

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

app.notFound(get404Route);

app.get("/feed.xml", getFeedRoute);

app.get("/", getIndexRoute);
app.get("/:page", getPageRoute);
app.get("/blog", getBlogIndexRoute);
app.get("/blog/:slug", getBlogPostRoute);

app.use("/webmention", s);
app.get("/webmention", getWebmentionRoute);
app.post("/webmention", postWebmentionRoute);

app.get("/patterns", deferImportGet("~/routes/patterns/index.js"));

/** Login route */
app
	.use(`/${LOGIN_PATH}`, s, noRobots(), async (c, next) => {
		const session = c.get("session");
		if (session.get("authorized") === true) return c.redirect("/sudo");
		await next();
	})
	.get(getLoginRoute)
	.post(postLoginRoute);

/** Sudo routes */
sudo.use("*", s, noRobots());
sudo.use("*", async (c, next) => {
	const session = c.get("session");
	// Intentionally do not expose the login URL
	if (session.get("authorized") !== true) return c.notFound();
	await next();
});
sudo.get("/", getSudoIndexRoute);
sudo.get("/content/:collectionType", getSudoContentCollectionTypeIndexRoute);
sudo.get("/content/:collectionType/new", (c) => {
	const { collectionType } = c.req.param();
	return c.text(`new ${collectionType}`);
});
sudo.get(
	"/content/:collectionType/:itemId",
	getSudoContentCollectionTypeItemRoute,
);
sudo.get("/webmentions", getSudoWebmentionsIndexRoute);
sudo.post("/webmentions", postSudoWebmentionsIndexRoute);
sudo.get("/exit", (c) => {
	const session = c.get("session");
	session.set("authorized", false);
	return c.redirect(`/${LOGIN_PATH}`);
});

app.route("/sudo", sudo);

Deno.serve(app.fetch);
