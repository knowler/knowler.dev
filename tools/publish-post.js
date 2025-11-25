import { markdownToHTML } from "../utils/markdown-to-html.js";
import { extract } from "https://deno.land/std@0.204.0/front_matter/toml.ts";
import paramCase from "https://deno.land/x/case@2.1.1/paramCase.ts";

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
invariant(MIGRATION_PATH);

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
invariant(MIGRATION_TOKEN);

const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");
invariant(PRODUCTION_URL);

const ENDPOINT = new URL(`${MIGRATION_PATH}/posts/create`, PRODUCTION_URL);

const [contentFile] = Deno.args;

const text = await Deno.readTextFile(contentFile);

const { attrs, body } = extract(text);

const publishedAt = new Date();

const post = {
	slug: attrs.slug ?? paramCase(attrs.title),
	title: attrs.title,
	description: attrs.description,
	publishedAt: publishedAt.toISOString(),
	published: attrs.published ?? true,
	html: String(await markdownToHTML(body)),
};

const response = await fetch(ENDPOINT, {
	method: "POST",
	body: JSON.stringify(page),
	headers: {
		"content-type": "application/json",
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

if (response.ok) {
	console.log(`Post published: ${PRODUCTION_URL}/${post.slug}`);
} else {
	console.error("Issue creating post");
}
