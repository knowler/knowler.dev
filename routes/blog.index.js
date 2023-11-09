import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { getPosts } from "~/models/posts.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c) {
	const posts = await getPosts();

	c.header("cache-control", "max-age=14400");

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts: posts.reverse().map(post => {
				post.prettyDateString = winnipegDateTime(new Date(post.publishedAt));
				return post;
			}),
			canonical: trimTrailingSlash(c.req.url),
		},
	);
}
