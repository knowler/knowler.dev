import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c) {
	const posts = await Array.fromAsync(
		c.get("kv").list({ prefix: ["posts"] }, { reverse: true }),
		entry => entry.value,
	);

	for (const post of posts) c.get("posts").store(post);

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
