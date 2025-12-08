import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";
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
			prettyCreatedAt: winnipegDateTime(new Date(content.createdAt)),
			prettyUpdatedAt: content.updatedAt ? winnipegDateTime(new Date(content.updatedAt)) : undefined,
		});
	} catch (e) {
		console.error(e);
		await next();
	}
}
