import { stringify } from "@std/toml";
import { extractToml as extract } from "@std/front-matter";

import { invariant } from "@knowler/shared/invariant";

import { htmlToMarkdown } from "./utils/html-to-markdown.js";
import { markdownToHTML } from "./utils/markdown-to-html.js";

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
invariant(MIGRATION_PATH);

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
invariant(MIGRATION_TOKEN);

const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");
invariant(PRODUCTION_URL);

const ENDPOINT = new URL(`${MIGRATION_PATH}/pages`, PRODUCTION_URL);

let response = await fetch(ENDPOINT, {
	method: "GET",
	headers: {
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

const pages = await response.json();
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

response = await fetch(`${ENDPOINT}/${slug}?by=slug`, {
	method: "GET",
	headers: {
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

if (!response.ok) throw `Page not found with slug: ${slug}`;

const page = await response.json();

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

const url = updatedPage.slug === "welcome" ? `${PRODUCTION_URL}/` : `${PRODUCTION_URL}/${updatedPage.slug}`;

response = await fetch(`${ENDPOINT}/${page.id}/update`, {
	method: "POST",
	body: JSON.stringify(updatedPage),
	headers: {
		"content-type": "application/json",
		authorization: `Bearer ${MIGRATION_TOKEN}`,
	},
});

if (response.ok) {
	await Deno.remove(fileName);
	console.log(
		`Successfully updated page: ${url}`,
	);
} else {
	console.error(`Could not update page. Edits are here: ${fileName}`)
}

