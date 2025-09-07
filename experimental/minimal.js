import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { serveStatic } from "hono/deno";

const minimal = new Hono();

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
	minimal.get(`/${page}`, async (c, next) => {
		const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
		if (enabled) return serveStatic({ path: `./experimental/minimal-templating/${page}.html` })(c, next);
		await next();
	});
}

minimal.get("/:page", async (c, next) => {
	const enabled = getCookie(c, "minimal-templating-flag") === "enabled";
	if (enabled) {
		const params = c.req.param();
		const html = await Deno.readTextFile(`./experimental/minimal-templating/${params.page}.html`);
		const kv = c.get("kv");
		const { value: id } = await kv.get(["pagesBySlug", params.page]);
		if (!id) throw "Page not found";
		const { value: page } = await kv.get(["pages", id]);

		return c.html(html + page.html);
	}
	await next();
});

export { minimal };
