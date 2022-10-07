import { CachedBlogPost } from "@prisma/client";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/db.server";
import proseStyles from "~/styles/prose.css";
import githubDarkStyles from 'highlight.js/styles/github-dark.css'
import githubStyles from 'highlight.js/styles/github.css'

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: proseStyles},
	{rel: 'stylesheet', href: githubDarkStyles, media: '(prefers-color-scheme: dark)'},
	{rel: 'stylesheet', href: githubStyles, media: '(prefers-color-scheme: light)'},
]

interface LoaderData {
  post: CachedBlogPost;
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
		const post = await prisma.cachedBlogPost.findUnique({
				where: {
				slug: z
          .string()
          .regex(/^[a-z0-9\-]*$/) // idk — security
          .parse(params.slug)
			},
		});

		if (post === null) throw "Post not found";

    return json<LoaderData>({ post });
  } catch (error) {
    throw new Response("Not found", { status: 404 });
  }
};

export const Meta: MetaFunction = ({ data }) => {
  const { post } = data as LoaderData;

  return {
    title: `${post.title} – Nathan Knowler`,
  };
};

export default function BlogPost() {
  const { post } = useLoaderData<LoaderData>();

  return (
    <article className="prose">
      <h1>{post.title}</h1>
      <p>
        <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toDateString()}</time>
      </p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

export function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <h1>
      {status}: {statusText}
    </h1>
  );
}
