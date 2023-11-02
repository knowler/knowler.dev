import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { getPostBySlug } from "~/models/posts.js";

export async function get(c, next) {
	try {
		const params = c.req.param();
		const post = await getPostBySlug(params.slug, { withWebmentions: true });

		return c.render("blog.[slug]", {
			title: post.title,
			description: post.description,
			post,
			canonical: trimTrailingSlash(c.req.url),
		});
	} catch (error) {
		console.error(error);
		await next();
	}
}
