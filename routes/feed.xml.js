import { Feed } from "npm:feed";
import { posts } from "~/models/posts.js";

const me = {
	name: 'Nathan Knowler',
	link: 'https://knowler.dev',
};

export async function GET() {
	const feed = new Feed({
		title: 'Nathan Knowler',
		description: 'Some words.',
		id: 'https://knowler.dev/',
		link: 'https://knowler.dev/',
		language: 'en-CA',
		copyright: 'All rights reservered 2022, Nathan Knowler',
		generator: 'Deno',
		author: me,
	});

	for (const post of posts) {
		feed.addItem({
			id: post.slug,
			title: post.title,
			description: post.description || undefined,
			link: `https://knowler.dev/blog/${post.slug}`,
			date: new Date(post.publishedAt),
			content: await Deno.readTextFile(`./routes/_blog/${post.slug}.html`),
			author: [me],
		});
	}

	return new Response(feed.rss2(), {
		status: 200,
		headers: {
			'Content-Type': 'text/xml',
			'Cache-Control': 'max-age=1800',
		},
	});
}

export const pattern = new URLPattern({ pathname: "/feed.xml" });
