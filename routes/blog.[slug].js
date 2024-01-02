import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { getPostBySlug } from "~/models/posts.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c, next) {
	const flags = c.get("session")?.get("flags");

	try {
		const params = c.req.param();
		const post = await getPostBySlug(params.slug, { withWebmentions: true });

		return c.render("blog.[slug]", {
			title: post.title,
			description: post.description,
			post,
			canonical: trimTrailingSlash(c.req.url),
			prettyDateString: winnipegDateTime(new Date(post.publishedAt)),
			flags: new Set(flags),
		});
	} catch (error) {
		console.error(error);
		await next();
	}
}
