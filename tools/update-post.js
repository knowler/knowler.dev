import { htmlToMarkdown } from "~/utils/html-to-markdown.js";
import { arrayFromAsync } from "~/utils/array-from-async.js";

import { stringify } from "std/toml";
import { extract } from "std/front_matter/toml";

import { kv } from "./utils/production-kv.js";
import { markdownToHTML } from "../utils/markdown-to-html.js";

const posts = await arrayFromAsync(
	kv.list({ prefix: ["posts"] }),
	(entry) => entry.value,
);
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
const post = posts.find((p) => p.slug === slug);
const { html, ...postWithoutHtml } = post;

const markdown = String(await htmlToMarkdown(html));
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

const url = `https://knowler.dev/blog/${updatedPost.slug}`;

await kv.set(["posts", post.id], updatedPost);

const purgeURL = new URL(Deno.env.get("SUPER_SECRET_CACHE_PURGE_ROUTE_PROD"), "https://knowler.dev");
purgeURL.searchParams.set("all", "");

await fetch(purgeURL);

await Deno.remove(fileName);

console.log(
	`Successfully updated post: ${url}`,
);
