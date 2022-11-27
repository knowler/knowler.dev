import type { LinksFunction, LoaderArgs, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import githubDarkStyles from 'highlight.js/styles/github-dark.css'
import githubStyles from 'highlight.js/styles/github.css'
import proseStyles from '~/styles/prose.css';
import { z } from "zod";
import { prisma } from "~/db.server";
import { omit } from "~/utils";

export const meta: MetaFunction = ({ data }) => {
  const { description, title } = data.post;
  return { title: `${title} – Nathan Knowler`, description };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
	{rel: 'stylesheet', href: proseStyles},
	{rel: 'stylesheet', href: githubDarkStyles, media: '(prefers-color-scheme: dark)'},
	{rel: 'stylesheet', href: githubStyles, media: '(prefers-color-scheme: light)'},
];

export async function loader({ params }: LoaderArgs) {
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
