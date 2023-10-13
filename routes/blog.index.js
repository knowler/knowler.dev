import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { getPosts } from "~/models/posts.js";

export async function get(c) {
	const posts = await getPosts();

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts: posts.reverse(),
			canonical: trimTrailingSlash(c.req.url),
		},
	);
}
