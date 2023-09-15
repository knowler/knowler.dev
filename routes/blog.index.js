import { posts } from "~/models/posts.js";

export async function GET({ view }) {
	return view(
		"blog.index",
		{
			title: "Blog",
			posts,
		},
	);
}

export const pattern = new URLPattern({ pathname: "/blog{/}?" });
