import { LoaderFunction } from "@remix-run/node";
import { Feed } from "feed";
import { prisma } from "~/db.server";

const me = {
	name: 'Nathan Knowler',
	link: 'https://knowler.dev',
};

export const loader: LoaderFunction = async () => {
	const feed = new Feed({
		title: 'Nathan Knowler',
		description: 'Some words.',
		id: 'https://knowler.dev/',
		link: 'https://knowler.dev/',
		language: 'en-CA',
		copyright: 'All rights reservered 2022, Nathan Knowler',
		generator: 'Remix',
		author: me,
	});

	const latestPosts = await prisma.cachedBlogPost.findMany({
		take: 10,
		orderBy: {
			publishedAt: 'desc',
		},
	});


	for (const post of latestPosts) {
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

	return new Response(feed.rss2(), {
		status: 200,
		headers: {
			'Content-Type': 'text/xml',
			'Cache-Control': 'max-age=1800',
		},
	});
}
