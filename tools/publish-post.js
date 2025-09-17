import { markdownToHTML } from "../utils/markdown-to-html.js";
import { extract } from "https://deno.land/std@0.204.0/front_matter/toml.ts";
import paramCase from "https://deno.land/x/case@2.1.1/paramCase.ts";
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";
import { kv } from "./utils/production-kv.js"

const [contentFile] = Deno.args;

const text = await Deno.readTextFile(contentFile);

const { attrs, body } = extract(text);

const publishedAt = new Date();
const id = ulid(Number(publishedAt));

const post = {
	id,
	slug: attrs.slug ?? paramCase(attrs.title),
	title: attrs.title,
	description: attrs.description,
	publishedAt: publishedAt.toISOString(),
	published: attrs.published ?? true,
	html: String(await markdownToHTML(body)),
};

await kv.set(["posts", post.id], post);
await kv.set(["postsBySlug", post.slug], post.id);

// Bust the content cache
await import("./utils/bust-content-cache.js");
