import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useLocation } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/db.server";
import proseStyles from "~/styles/prose.css";
import githubDarkStyles from 'highlight.js/styles/github-dark.css'
import githubStyles from 'highlight.js/styles/github.css'
import { getSeoMeta } from "~/seo";

export const links: LinksFunction = () => [
	{rel: 'stylesheet', href: proseStyles},
	{rel: 'stylesheet', href: githubDarkStyles, media: '(prefers-color-scheme: dark)'},
	{rel: 'stylesheet', href: githubStyles, media: '(prefers-color-scheme: light)'},
];

export const meta: MetaFunction = ({ data }) => {
  const { post } = data;

	return getSeoMeta({
		title: post.title,
		description: post.description,
	});
};

export const loader: LoaderFunction = async ({ params }) => {
  try {
		const post = await prisma.post.findFirst({
			where: {
				published: true,
				slug: z
          .string()
          .regex(/^[a-z0-9\-]*$/) // idk — security
          .parse(params.slug)
			},
		});

		if (post === null) throw "Post not found";

    return json({ post });
  } catch (error) {
    throw new Response("Not found", { status: 404 });
  }
};

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();
	const location = useLocation();

  return (
		<>
			<article className="h-entry prose">
				<h1 className="p-name">{post.title}</h1>
				<p>
					<time className="dt-published" dateTime={post.publishedAt}>{new Date(post.publishedAt).toDateString()}</time> – <Link className="u-url" aria-current="page" rel="bookmark" to="">Permalink</Link>
				</p>
				<div className="e-content prose" dangerouslySetInnerHTML={{ __html: post.html }} />
			</article>
			<aside className="flow">
				<h2>Webmentions</h2>
				<p>This post has no webmentions. Use the form below to send one.</p>
				<Form method="post" action="/webmention" className="flow">
					<input hidden name="robotName" />
					<input type="hidden" name="target" value={new URL(location.pathname, process.env.BASE_URL).toString()} />
					<form-field>
						<label htmlFor="webmention-source">Source</label>
						<input type="url" id="webmention-source" name="source" required placeholder="https://blog.example/awesome-reblog" style={{inlineSize: '32ch'}} />
					</form-field>
					<button className="button">Send Webmention</button>
				</Form>
			</aside>
		</>
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
