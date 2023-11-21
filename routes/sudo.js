import { Hono } from "hono";
import { noRobots } from "~/middleware/no-robots.js";
import { s } from "~/middleware/session.js";
import { invariant } from "~/utils/invariant.js";

const LOGIN_PATH = Deno.env.get("LOGIN_PATH");
invariant(LOGIN_PATH);

const sudo = new Hono();

/**
 * SUDO ROUTES
 */
sudo.use("*", s, noRobots(), async (c, next) => {
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

export { sudo };
