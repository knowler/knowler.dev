import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c, next) {
	try {
		const { slug } = c.req.param();
		const kv = c.get("kv");
		const { value: id } = await kv.get(["postsBySlug", slug]);
		if (!id) throw `Post with slug "${slug}" not found`;
		const { value: post } = await kv.get(["posts", id]);

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
