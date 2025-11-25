import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { bearerAuth } from "hono/bearer-auth";

import { ulid } from "@std/ulid";

import en from "nanoid-good/locale/en.js";
import nanoidGood from "nanoid-good/index.js";

import { invariant } from "~/utils/invariant.js";

const nanoid = nanoidGood.nanoid(en);

const api = new Hono();

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");

invariant(MIGRATION_TOKEN);

api.use(prettyJSON());
api.use(bearerAuth({ token: MIGRATION_TOKEN }));

api.get("/pages", async (c, next) => {
	const pages = await Array.fromAsync(
		c.get("kv").list({ prefix: ["pagesBySlug"] }),
		result => ({ slug: result.key[1], id: result.value })
	);

	return c.json(pages);
});

api.get("/pages/:id", async (c, next) => {
	const page = await c.get("kv").get(["pages", c.req.param("id")]);

	return c.json(page.value);
});

api.post("/pages/:id/update", async (c, next) => {
	const page = await c.req.json();

	await c.get("kv").set(["pages", c.req.param("id")], { id, ...page });

	await bustContentCache(c.get("kv"));

	return c.json({ message: "success" });
});

api.post("/pages/create", async (c, next) => {
	const page = await c.req.json();
	const id = crypto.randomUUID();

	await c.get("kv").set(["pages", id], { id, ...page });
	await c.get("kv").set(["pagesBySlug", page.slug], id);

	return c.json({ message: "success" });
});

api.get("/posts", async (c, next) => {
	const posts = await Array.fromAsync(
		c.get("kv").list({ prefix: ["postsBySlug"] }),
		result => ({ slug: result.key[1], id: result.value })
	);

	return c.json(posts);
});

api.get("/posts/:id", async (c, next) => {
	const post = await c.get("kv").get(["posts", c.req.param("id")]);

	return c.json(post.value);
});

api.post("/posts/:id/update", async (c, next) => {
	const post = await c.req.json();

	await c.get("kv").set(["posts", c.req.param("id")], { id, ...post });

	await bustContentCache(c.get("kv"));

	return c.json({ message: "success" });
});

api.post("/posts/create", async (c, next) => {
	const post = await c.req.json();
	const id = ulid(Number(post.publishedAt));

	await c.get("kv").set(["posts", id], { id, ...post });
	await c.get("kv").set(["postsBySlug", post.slug], id);

	return c.json({ message: "success" });
});

api.get("/demos", async (c, next) => {
	const demos = await Array.fromAsync(
		c.get("kv").list({ prefix: ["demos"] }),
		result => ({
			id: result.key[1],
			...result.value,
		}),
	);

	return c.json(demos);
});

api.get("/demos/:id", async (c, next) => {
	const demo = await c.get("kv").get(["demos", c.req.param("id")]);

	return c.json(demo.value);
});

api.post("/demos/create", async (c, next) => {
	const id = await nanoid(7);
	const demo = await c.req.json();

	await c.get("kv").set(["demos", id], demo);

	return c.json({ message: "success" });
});

api.post("/demos/:id/update", async (c, next) => {
	const demo = await c.req.json();

	await c.get("kv").set(["demos", c.req.param("id")], demo);

	await bustDemosCache(c.get("kv"));

	return c.json({ message: "success" });
});

api.post("/demos/:id/delete", async (c, next) => {
	const demo = await c.get("kv").delete(["demos", c.req.param("id")])

	await bustDemosCache(c.get("kv"));

	return c.json({ message: "success" });
});

export { api };

async function bustContentCache(kv) {
	const { value: cache_versions } = await kv.get(["cache_versions"]);
	cache_versions.content_version = Date.now();
	await kv.set(["cache_versions"], cache_versions);
}

async function bustDemosCache(kv) {
	const { value: cache_versions } = await kv.get(["cache_versions"]);
	cache_versions.demos_version = Date.now();
	await kv.set(["cache_versions"], cache_versions);
}
