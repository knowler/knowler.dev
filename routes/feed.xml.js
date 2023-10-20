import { Feed } from "feed";
import { getPosts } from "~/models/posts.js";

const me = {
	name: "Nathan Knowler",
	link: "https://knowler.dev",
};

export async function get(c) {
	const posts = await getPosts();

	const feed = new Feed({
		title: "Nathan Knowler",
		description: "Some words.",
		id: "https://knowler.dev/",
		link: "https://knowler.dev/",
		language: "en-CA",
		copyright: "All rights reserved 2023, Nathan Knowler",
		generator: "Deno",
		author: me,
	});

	for (const post of posts.reverse()) {
		feed.addItem({
			id: post.slug,
			title: post.title,
			description: post.description || undefined,
			link: `https://knowler.dev/blog/${post.slug}`,
			date: new Date(post.publishedAt),
			content: post.html,
			author: [me],
		});
	}

	c.header("content-type", "text/xml; charset=UTF-8");
	c.header("Cache-Control", "max-age=1800");

	return c.body(feed.rss2());
}
