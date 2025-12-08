import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { parseHTML } from "npm:linkedom";

export async function get(c, next) {
	try {
		const params = c.req.param();
		const kv = c.get("kv");
		const { value: id } = await kv.get(["gardenBySlug", params.slug]);
		const { value: content } = await kv.get(["garden", id]);

		return c.render("garden.[slug]", {
			title: parseHTML(`<h1>${content.title}</h1>`)?.document.querySelector("h1")?.textContent ?? content.title ?? "Untitled note",
			headline: content.title, 
			content,
			canonical: trimTrailingSlash(c.req.url),
		});
	} catch (e) {
		console.error(e);
		await next();
	}
}
