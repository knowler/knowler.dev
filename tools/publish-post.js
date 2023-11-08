import { markdownToHTML } from "../utils/markdown-to-html.js";
import { extract } from "https://deno.land/std@0.204.0/front_matter/toml.ts";
import paramCase from "https://deno.land/x/case@2.1.1/paramCase.ts";

const DENO_KV_DB_UUID = Deno.env.get("DENO_KV_DB_UUID");
const kv = await Deno.openKv(`https://api.deno.com/databases/${DENO_KV_DB_UUID}/connect`);

const [contentFile] = Deno.args;

const text = await Deno.readTextFile(contentFile);

const {attrs, body} = await extract(text);

const post = {
	id: crypto.randomUUID(),
	slug: attrs.slug ?? paramCase(attrs.title),
	title: attrs.title,
	description: attrs.description,
	publishedAt: new Date().toISOString(),
	published: attrs.published ?? true,
	html: String(await markdownToHTML(body)),
}

await kv.set(["posts", post.id], post);
await kv.set(["postsBySlug", post.slug], post.id);
