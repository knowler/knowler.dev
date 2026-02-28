import { Feed } from "feed";
import { parseHTML } from "linkedom";

const me = {
	name: "Nathan Knowler",
	link: "https://knowler.dev",
};

export async function get(c) {
	const kv = c.get("kv");
	const list = kv.list({ prefix: ["posts"] }, { limit: 10, reverse: true });
	const posts = await Array.fromAsync(list, item => item.value);

	const feed = new Feed({
		title: "Nathan Knowler",
		description: "Some words.",
		id: "https://knowler.dev/",
		link: "https://knowler.dev/",
		language: "en-CA",
		copyright:
			"Code and content by Nathan Knowler. Except if noted otherwise, content on this website is licensed under a CC BY-NC-SA 4.0 license.",
		generator: "Deno",
		author: me,
	});
	
	let count = 1;
	for (const post of posts) {
		// Store in the object cache if not already there
		c.get("posts").store(post);

		feed.addItem({
			id: post.slug,
			title: parseHTML(`<h1>${post.title}</h1>`).document.querySelector("h1").textContent,
			description: post.description ? parseHTML(`<p>${post.description}</p>`).document.querySelector("p").textContent : undefined,
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
