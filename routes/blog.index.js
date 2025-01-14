import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c) {
	let posts = (await c.get("posts").list()).reverse();

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts: posts.map((post) => {
				post.prettyDateString = winnipegDateTime(new Date(post.publishedAt));
				return post;
			}),
			canonical: trimTrailingSlash(c.req.url),
		},
	);
}
