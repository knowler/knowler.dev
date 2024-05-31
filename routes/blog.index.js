import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";

export async function get(c) {
	/*
	let posts, page, isOldest, isMostRecent;

	if (c.get("flags").has("blog:pagination")) {
		// before is older than
		// after is newer than
		const { before, after, oldest } = c.req.query();
		isOldest = typeof oldest === "string";
		isMostRecent = !isOldest && !before && !after;
		page = await c.get("posts").page(isMostRecent ? undefined : { before, after, oldest: isOldest });
		posts = page.posts;

		if (before && !page.hasNext) isOldest = true;
		if (after && !page.hasNext) isMostRecent = true;
	} else {
		posts = (await c.get("posts").list()).reverse();
	}
	*/

	let posts = (await c.get("posts").list()).reverse();

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts: posts.map((post) => {
				post.prettyDateString = winnipegDateTime(new Date(post.publishedAt));
				return post;
			}),
			//isMostRecent,
			//isOldest,
			canonical: trimTrailingSlash(c.req.url),
		},
	);
}
