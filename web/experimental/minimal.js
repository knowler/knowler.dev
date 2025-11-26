import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";

const minimal = new Hono();

minimal.get("/", ifEnabled(async (c, next) => {
	const [html, page] = await Promise.all([
		Deno.readTextFile(`./experimental/minimal-templating/index.html`),
		getPage("welcome"),
	]);

	return c.html(html + page.html);
}));

minimal.use("*", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) return serveStatic({ root: "./experimental/minimal-templating" })(c, next);
	await next();
});

const pages = [
	"blog",
	"navigation",
	"colophon",
];

for (const page of pages) {
	minimal.get(`/${page}`, ifEnabled(async (c, next) => serveStatic({ path: `./experimental/minimal-templating/${page}.html` })(c, next)));
}

minimal.get("/:page", ifEnabled(async (c, next) => {
	const slug = c.req.param("page");
	const [html, page] = await Promise.all([
		Deno.readTextFile(`./experimental/minimal-templating/${slug}.html`),
		getPage(slug),
	]);

	return c.html(html + page.html);
}));

export { minimal };

async function getPage(slug) {
	const kv = await Deno.openKv();
	const { value: id } = await kv.get(["pagesBySlug", slug]);
	if (!id) throw "Page not found";
	const { value: page } = await kv.get(["pages", id]);
	return page;
}

function ifEnabled(route) {
	return async (c, next) => {
		const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
		if (enabled) {
			const result = await route(c, next);
			if (result instanceof Response) return result;
		}
		await next();
	}
}
