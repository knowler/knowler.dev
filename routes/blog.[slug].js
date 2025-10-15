import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";
import { parseHTML } from "npm:linkedom";

export async function get(c, next) {
	try {
		const { slug } = c.req.param();
		const post = await c.get("posts").getBySlug(slug);
		if (!post) throw `Post with slug "${slug}" not found`;

		return c.render("blog.[slug]", {
			title: post.title,
			headline: parseHTML(`<h1>${post.title}</h1>`)?.document.querySelector("h1")?.textContent ?? title,
			description: post.description,
			post,
			canonical: trimTrailingSlash(c.req.url),
			prettyDateString: winnipegDateTime(new Date(post.publishedAt)),
		});
	} catch (error) {
		console.error(error);
		await next();
	}
}
