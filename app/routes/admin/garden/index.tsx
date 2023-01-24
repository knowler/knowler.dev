import { json, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
	await authOrLogin(request);

	return json({
		posts: await prisma.gardenPost.findMany({ take: 10 }),
	});
}

export default function GardenList() {
	const { posts } = useLoaderData<typeof loader>();

	return (
		<article className="flow" style={{ '--space': 'var(--size-4)' }}>
			<article-header>
				<h1>Garden</h1>
				<Link to="new">New Garden Post</Link>
				<Link to="backup" download>Backup</Link>
			</article-header>
			<ul role="list" className="card-grid">
				{posts.map(post => (
					<li key={post.id} className="card">
						<article className="flow">
							<h2>{post.title}</h2>
							<p>
								<Link to={`edit/${post.id}`}>Edit</Link> <Link to={`/garden/${post.slug}`}>Garden</Link>
							</p>
						</article>
					</li>
				))}
			</ul>
		</article>
	);
}
