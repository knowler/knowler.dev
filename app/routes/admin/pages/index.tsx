import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";
import adminPagesStyles from "~/styles/admin-pages.css";

export const links: LinksFunction = () => [
	{rel: "stylesheet", href: adminPagesStyles},
];

export const loader: LoaderFunction = async ({request}) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  return json({
		published: await prisma.page.findMany({ take: 10, where: { published: true } }),
		drafted: await prisma.page.findMany({ take: 10, where: { published: false } }),
  });
};

export default function PageList() {
  const { published, drafted } = useLoaderData<typeof loader>();

  return (
    <article>
			<article-header>
				<h1>Pages</h1>
				<Link to="new">New Page</Link>
			</article-header>
			<h2>Published</h2>
			<ul role="list">
				{published.map(page => (
					<li key={page.id}>
						<article>
							<h3>{page.title}</h3>
							<p>{page.description ?? "(No page description)"}</p>
							<p>
								<Link to={`edit/${page.id}`}>Edit</Link> <Link to={`/${page.slug}`}>View</Link>
							</p>
						</article>
					</li>
				))}
			</ul>
			<h2>Drafts</h2>
			<ul role="list">
				{drafted.map(page => (
					<li key={page.id}>
						<article>
							<h3>{page.title}</h3>
							<p><Link to={`edit/${page.id}`}>Edit</Link></p>
						</article>
					</li>
				))}
			</ul>
    </article>
  );
}
