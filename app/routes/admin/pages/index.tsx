import { json, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
	await authOrLogin(request);

	return json({
		published: await prisma.page.findMany({ take: 10, where: { published: true } }),
		drafted: await prisma.page.findMany({ take: 10, where: { published: false } }),
	});
};

export default function PageList() {
	const { published, drafted } = useLoaderData<typeof loader>();

	return (
		<article className="flow" style={{ "--space": "var(--size-4)" }}>
			<article-header>
				<h1>Pages</h1>
				<Link to="new">New Page</Link>
				<Link to="backup" download>Backup</Link>
			</article-header>
			<section className="flow" style={{ "--space": "var(--size-4)" }}>
				<h2>Published</h2>
				<ul role="list" className="card-grid">
					{published.map(page => (
						<li key={page.id} className="card">
							<article className="flow">
								<h3>{page.title}</h3>
								<p>{page.description ?? "(No page description)"}</p>
								<p>
									<Link to={`edit/${page.id}`}>Edit</Link> <Link to={`/${page.slug}`}>View</Link>
								</p>
							</article>
						</li>
					))}
				</ul>
			</section>
			<section className="flow" style={{ "--space": "var(--size-4)" }}>
				<h2>Drafts</h2>
				<ul role="list" className="card-grid">
					{drafted.map(page => (
						<li key={page.id} className="card">
							<article className="flow">
								<h3>{page.title}</h3>
								<p><Link to={`edit/${page.id}`}>Edit</Link></p>
							</article>
						</li>
					))}
				</ul>
			</section>
		</article>
	);
}
