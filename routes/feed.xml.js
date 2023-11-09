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
		copyright: "Code and content by Nathan Knowler. Except if noted otherwise, content on this website is licensed under a CC BY-NC-SA 4.0 license.",
		generator: "Deno",
		author: me,
	});

	let count = 1;
	for (const post of posts.reverse()) {
		if (count === 10) break;
		feed.addItem({
			id: post.slug,
			title: post.title,
			description: post.description || undefined,
			link: `https://knowler.dev/blog/${post.slug}`,
			date: new Date(post.publishedAt),
			content: post.html,
			author: [me],
		});
		count++;
	}

	c.header("content-type", "text/xml; charset=UTF-8");
	c.header("cache-control", "s-maxage=14400");

	return c.body(feed.rss2());
}
