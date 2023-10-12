import { Hono } from "hono";

/** Middlewares */
import { logger, serveStatic } from "hono/middleware";
import { CookieStore, sessionMiddleware } from "hono_sessions";
import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { noRobots } from "~/middleware/no-robots.js";

/** Jobs */
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";

/** Routes */
import { get as get404Route } from "~/routes/404.js";
import { get as getIndexRoute } from "~/routes/index.js";
import { get as getFeedRoute } from "~/routes/feed.xml.js";
import { get as getBlogIndexRoute } from "~/routes/blog.index.js";
import { get as getBlogPostRoute } from "~/routes/blog.[slug].js";
import { get as getPageRoute } from "~/routes/[page].js";
import {
	get as getLoginRoute,
	post as postLoginRoute,
} from "~/routes/login.js";

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

app.use(
	"*",
	pugRenderer(),
	logger(),
	serveStatic({ root: "./assets" }),
	rewriteWithoutTrailingSlashes(),
	sessionMiddleware({
		store: new CookieStore(),
		sessionCookieName: "__session",
		expireAfterSeconds: 60 * 60 * 24 * 7,
		encryptionKey: Deno.env.get("SESSION_KEY"),
		cookieOptions: {
			path: "/",
			domain: new URL(Deno.env.get("SITE_URL")).hostname,
			httpOnly: true,
			secure: false,
			sameSite: "Lax",
		},
	}),
);

app.notFound(get404Route);

app.get("/feed.xml", getFeedRoute);
app.get("/", getIndexRoute);
app.get("/blog", getBlogIndexRoute);
app.get("/blog/:slug", getBlogPostRoute);

/** Login route */
app
	.use(`/${Deno.env.get("LOGIN_PATH")}`, noRobots(), async (c, next) => {
		const session = c.get("session");
		if (session.get("authorized") === true) return c.redirect("/sudo");
		await next();
	})
	.get(getLoginRoute)
	.post(postLoginRoute);

/** Sudo routes */
sudo.use("*", noRobots());
sudo.use("*", async (c, next) => {
	const session = c.get("session");
	// Intentionally do not expose the login URL
	if (session.get("authorized") !== true) return c.notFound();
	await next();
});
sudo.get("/", (c) => c.text("Sudo"));
sudo.get("/exit", (c) => {
	const session = c.get("session");
	session.set("authorized", false);
	return c.redirect(`/${Deno.env.get("LOGIN_PATH")}`);
});

app.route("/sudo", sudo);

app.get("/:page", getPageRoute);

Deno.serve(app.fetch);
