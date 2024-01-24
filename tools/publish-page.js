import { markdownToHTML } from "../utils/markdown-to-html.js";
import { extract } from "https://deno.land/std@0.204.0/front_matter/toml.ts";
import paramCase from "https://deno.land/x/case@2.1.1/paramCase.ts";
import { kv } from "./utils/production-kv.js";

const [contentFile] = Deno.args;

const text = await Deno.readTextFile(contentFile);

const { attrs, body } = extract(text);

const page = {
	id: crypto.randomUUID(),
	slug: attrs.slug ?? paramCase(attrs.title),
	title: attrs.title,
	description: attrs.description,
	published: attrs.published ?? true,
	html: String(await markdownToHTML(body)),
};

await kv.set(["pages", page.id], page);
await kv.set(["pagesBySlug", page.slug], page.id);
