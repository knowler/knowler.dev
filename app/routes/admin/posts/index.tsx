import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({ request }) => {
	await authOrLogin(request);

	return json({
		published: await prisma.post.findMany({ take: 10, where: { published: true } }),
		drafted: await prisma.post.findMany({ take: 10, where: { published: false } }),
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
				<ul role="list" className="card-grid">
					{published.map(post => (
						<li key={post.id} className="card">
							<article className="flow">
								<h3>{post.title}</h3>
								{post.description ? <p>{post.description}</p> : null}
								<p>
									<Link to={`edit/${post.id}`}>Edit</Link> <Link to={`/blog/${post.slug}`}>View</Link>
								</p>
							</article>
						</li>
					))}
				</ul>
			</section>
			<section className="flow" style={{ "--space": "var(--size-4)" }}>
				<h2>Drafts</h2>
				<ul role="list" className="card-grid">
					{drafted.map(post => (
						<li key={post.id} className="card">
							<article className="flow">
								<h3>{post.title}</h3>
								<p>{post.description ?? "(No post description)"}</p>
								<p>
									<Link to={`edit/${post.id}`}>Edit</Link>
								</p>
							</article>
						</li>
					))}
				</ul>
			</section>
		</article>
	);
}
