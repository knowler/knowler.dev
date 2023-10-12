import { Hono } from "hono";
import { logger, serveStatic } from "hono/middleware";
import { pugRenderer } from "~/middleware/pug-renderer.js";
import { rewriteWithoutTrailingSlashes } from "~/middleware/rewrite-without-trailing-slashes.js";
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";

import { get as get404Route } from "~/routes/404.js";
import { get as getIndexRoute } from "~/routes/index.js";
import { get as getFeedRoute } from "~/routes/feed.xml.js";
import { get as getBlogIndexRoute } from "~/routes/blog.index.js";
import { get as getBlogPostRoute } from "~/routes/blog.[slug].js";
import { get as getPageRoute } from "~/routes/[page].js";

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

app.use("*", pugRenderer());
app.use("*", logger());
app.use("*", serveStatic({ root: "./assets" }));
app.use("*", rewriteWithoutTrailingSlashes());

app.notFound(get404Route);

app.use("/feed.xml", getFeedRoute);

app.get("/", getIndexRoute);
app.get("/blog", getBlogIndexRoute);
app.get("/blog/:slug", getBlogPostRoute);
app.get("/:page", getPageRoute);

Deno.serve(app.fetch);
