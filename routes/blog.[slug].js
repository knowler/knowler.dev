import { renderFile } from "pug";
import { posts } from "~/models/posts.js";

export async function GET({ view, params }) {
	const post = posts.find(({ slug }) => slug === params.slug);

	if (!post) throw new Response("Not found", { status: 404 });

	post.html = await Deno.readTextFile(`./routes/_blog/${post.slug}.html`);

	return view(
		"blog.[slug]",
		{
			title: post.title,
			description: post.description,
			post,
		},
	);
}

export const pattern = new URLPattern({ pathname: "/blog/:slug{/}?" });
