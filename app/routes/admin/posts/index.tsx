import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { winterpegDateTime } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
	await authOrLogin(request);

	return json({
		published: await prisma.post.findMany({
			take: 10,
			where: { published: true },
			orderBy: { publishedAt: 'desc' },
		}),
		drafted: await prisma.post.findMany({
			take: 10,
			where: { published: false },
			orderBy: { createdAt: 'desc' },
		}),
	});
};

export default function PostsIndex() {
	const { published, drafted } = useLoaderData<typeof loader>();

	return (
		<article className="flow" style={{"--space": "var(--size-4)"}}>
			<article-header>
				<h1>Posts</h1>
				<Link to="new">New Post</Link>
			</article-header>
			<section className="flow" style={{ "--space": "var(--size-4)" }}>
				<h2>Published</h2>
				<ol role="list" reversed className="card-grid">
					{published.map(post => (
						<li key={post.id} className="card">
							<article className="flow">
								<h3>{post.title}</h3>
								<p><time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleString('en-ca', {timeZone: 'America/Winnipeg'})}</time></p>
								{post.description ? <p>{post.description}</p> : null}
								<p>
									<Link to={`edit/${post.id}`}>Edit</Link> <Link to={`/blog/${post.slug}`}>View</Link>
								</p>
							</article>
						</li>
					))}
				</ol>
			</section>
			<section className="flow" style={{ "--space": "var(--size-4)" }}>
				<h2>Drafts</h2>
				<ol role="list" reversed className="card-grid">
					{drafted.map(post => (
						<li key={post.id} className="card">
							<article className="flow">
								<h3>{post.title}</h3>
								<p><time dateTime={post.createdAt}>{winterpegDateTime(post.createdAt)}</time></p>
								<p>{post.description ?? "(No post description)"}</p>
								<p>
									<Link to={`edit/${post.id}`}>Edit</Link>
								</p>
							</article>
						</li>
					))}
				</ol>
			</section>
		</article>
	);
}
