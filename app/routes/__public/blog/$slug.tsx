import { CachedBlogPost } from "@prisma/client";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/db.server";
import proseStyles from "~/styles/prose.css";

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: proseStyles},
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
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
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
