import type { LinksFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import githubDarkStyles from 'highlight.js/styles/github-dark.css'
import githubStyles from 'highlight.js/styles/github.css'
import { z } from "zod";
import { prisma } from "~/db.server";
import { omit } from "~/utils";

export const meta: MetaFunction = ({ data }) => {
  const { description, title } = data;
  return { title: `${title} – Nathan Knowler`, description };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
	{rel: 'stylesheet', href: githubDarkStyles, media: '(prefers-color-scheme: dark)'},
	{rel: 'stylesheet', href: githubStyles, media: '(prefers-color-scheme: light)'},
];

export const loader: LoaderFunction = async ({ params }) => {
	const post = await prisma.gardenPost.findFirst({where: {slug: z.string().regex(/^[a-z0-9\-]*$/).parse(params.slug)}});

	if (!post) return json({}, 404);

  return json({ post: omit(post, 'markdown') });
};

export default function GardenPost() {
  const { post } = useLoaderData<typeof loader>();

	return (
		<article>
			<h1>{post.title}</h1>
			<div className="prose" dangerouslySetInnerHTML={{__html: post.html}} />
		</article>
	);
}
