import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c, next) {
	try {
		const { slug } = c.req.param();
		const post = await c.get("posts").get(slug);

		return c.render("blog.[slug]", {
			title: post.title,
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
