import { htmlToMarkdown } from "~/utils/html-to-markdown.js";

import { stringify } from "@std/toml";
import { extractToml as extract } from "@std/front-matter";

import { markdownToHTML } from "../utils/markdown-to-html.js";
import { invariant } from "../utils/invariant.js";

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
invariant(MIGRATION_PATH);

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
invariant(MIGRATION_TOKEN);

const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");
invariant(PRODUCTION_URL);

const ENDPOINT = new URL(`${MIGRATION_PATH}/posts`, PRODUCTION_URL);

let response = await fetch(ENDPOINT, {
	method: "GET",
	headers: {
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

const posts = await response.json();
const slugs = posts.map((post) => post.slug).join("\n");

const echo = new Deno.Command("echo", { args: [slugs] });
const fzf = new Deno.Command("fzf", { stdin: "piped", stdout: "piped" })
	.spawn();

const echoOutput = await echo.output();

const writer = fzf.stdin.getWriter();

await writer.write(echoOutput.stdout);
await writer.ready;
await writer.close();

const fzfOutput = await fzf.output();

if (!fzfOutput.success) {
	console.error(new TextDecoder().decode(fzfOutput.stderr));
	Deno.exit();
}

const slug = new TextDecoder().decode(fzfOutput.stdout).trim();

response = await fetch(`${ENDPOINT}/${slug}?by=slug`, {
	method: "GET",
	headers: {
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

if (!response.ok) throw `Post not found with slug: ${slug}`;

const post = await response.json();

const { html, ...postWithoutHtml } = post;

const markdown = String(await htmlToMarkdown(html));
console.log(postWithoutHtml);
const frontmatter = stringify(postWithoutHtml);

const markdownWithFrontmatter = `---toml\n${frontmatter}---\n${markdown}`;

const fileName = `${post.id}.md`;

await Deno.writeTextFile(fileName, markdownWithFrontmatter);

const editor = new Deno.Command(Deno.env.get("EDITOR"), { args: [fileName] })
	.spawn();
const editorOutput = await editor.output();

if (!editorOutput.success) {
	console.error(new TextDecoder().decode(editorOutput.stderr));
	Deno.exit();
}

const { body, attrs } = extract(await Deno.readTextFile(fileName));

const updatedPost = {
	...attrs,
	html: String(await markdownToHTML(body)),
	updatedAt: new Date().toISOString(),
};

const url = `${PRODUCTION_URL}/blog/${updatedPost.slug}`;

response = await fetch(`${ENDPOINT}/${post.id}/update`, {
	method: "POST",
	body: JSON.stringify(updatedPost),
	headers: {
		"content-type": "application/json",
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

if (response.ok) {
	await Deno.remove(fileName);
	console.log(
		`Successfully updated post: ${url}`,
	);
} else {
	console.error(`Could not update post. Edits are here: ${fileName}`)
}

