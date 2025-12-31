import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { bearerAuth } from "hono/bearer-auth";

import { ulid } from "@std/ulid";

import en from "nanoid-good/locale/en.js";
import nanoidGood from "nanoid-good/index.js";

import { invariant } from "@knowler/shared/invariant";

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

api.get("/pages/:idOrSlug", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await pageBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const { value: page } = await kv.get(["pages", id]);

	return c.json(page);
});

api.post("/pages/:idOrSlug/update", async (c, next) => {
	const page = await c.req.json();

	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await pagesBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	await c.get("kv").set(["pages", id], { id, ...page });

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

api.post("/pages/:idOrSlug/delete", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await pagesBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const { value: page } = await kv.get(["pages", id]);

	await kv.delete(["pages", page.id]);
	await kv.delete(["pagesBySlug", page.slug]);

	await bustContentCache(c.get("kv"));

	return c.json({ message: "success" });
});

api.get("/posts", async (c, next) => {
	const posts = await Array.fromAsync(
		c.get("kv").list({ prefix: ["postsBySlug"] }),
		result => ({ slug: result.key[1], id: result.value })
	);

	return c.json(posts);
});

api.get("/posts/:idOrSlug", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await postBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const post = await c.get("kv").get(["posts", id]);

	return c.json(post.value);
});

api.post("/posts/:id/update", async (c, next) => {
	const post = await c.req.json();
	const id = c.req.param("id");

	await c.get("kv").set(["posts", id], { id, ...post });

	await bustContentCache(c.get("kv"));

	return c.json({ message: "success" });
});

api.post("/posts/create", async (c, next) => {
	const post = await c.req.json();
	const id = ulid(Number(new Date(post.publishedAt)));

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

	return c.json({ message: "success", id });
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

/** GARDEN */

api.get("/garden", async (c, next) => {
	const garden = await Array.fromAsync(
		c.get("kv").list({ prefix: ["garden"] }),
		result => ({
			id: result.key[1],
			...result.value,
		}),
	);

	return c.json(garden);
});

api.post("/garden/create", async (c, next) => {
	const kv = c.get("kv");
	const content = await c.req.json();

	const id = ulid(Number(new Date(content.createdAt)));
	const slug = content.slug ??= await nanoid(7);

	await kv.set(["garden", id], content);
	await kv.set(["gardenBySlug", slug], id);

	return c.json({ message: "success", id, slug });
});

api.get("/garden/:idOrSlug", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await gardenBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const { value: content } = await kv.get(["garden", id]);

	return c.json(content);
});

api.post("/garden/:idOrSlug/update", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await gardenBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const content = await c.req.json();

	await kv.set(["garden", id], content);

	return c.json({ message: "success" });
});

api.post("/garden/:idOrSlug/delete", async (c, next) => {
	const kv = c.get("kv");
	const isBySlug = c.req.query("by") === "slug";

	const id = isBySlug
		? await gardeBySlug(kv, c.req.param("idOrSlug"))
		: c.req.param("idOrSlug");

	const { value: content } = await kv.get(["garden", id]);

	await kv.delete(["garden", id]);
	await kv.delete(["gardenBySlug", content.slug]);

	return c.json({ message: "success" });
});

/** EXPORTS */

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

async function pageBySlug(kv, slug) {
	const result = await kv.get(["pagesBySlug", slug]);
	return result.value;
}

async function postBySlug(kv, slug) {
	const result = await kv.get(["postsBySlug", slug]);
	return result.value;
}

async function gardenBySlug(kv, slug) {
	const result = await kv.get(["gardenBySlug", slug]);
	return result.value;
}
