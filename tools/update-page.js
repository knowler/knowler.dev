import { htmlToMarkdown } from "~/utils/html-to-markdown.js";

import { stringify } from "@std/toml";
import { extractToml as extract } from "@std/front-matter";

import { kv } from "./utils/production-kv.js";
import { markdownToHTML } from "../utils/markdown-to-html.js";

const pages = await Array.fromAsync(
	kv.list({ prefix: ["pages"] }),
	(entry) => entry.value,
);
const slugs = pages.map((page) => page.slug).join("\n");

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
const page = pages.find((p) => p.slug === slug);
const { html, ...pageWithoutHtml } = page;

const markdown = String(await htmlToMarkdown(html));
const frontmatter = stringify(pageWithoutHtml);

const markdownWithFrontmatter = `---toml\n${frontmatter}---\n${markdown}`;

const fileName = `${page.id}.md`;

await Deno.writeTextFile(fileName, markdownWithFrontmatter);

const editor = new Deno.Command(Deno.env.get("EDITOR"), { args: [fileName] })
	.spawn();
const editorOutput = await editor.output();

if (!editorOutput.success) {
	console.error(new TextDecoder().decode(editorOutput.stderr));
	Deno.exit();
}

const { body, attrs } = extract(await Deno.readTextFile(fileName));

const updatedPage = {
	...attrs,
	html: String(await markdownToHTML(body)),
};

const url = updatedPage.slug === "welcome" ? "https://knowler.dev/" : `https://knowler.dev/${updatedPage.slug}`;

await kv.set(["pages", page.id], updatedPage);

await import("./utils/bust-content-cache.js");

await Deno.remove(fileName);

console.log(
	`Successfully updated page: ${url}`,
);
