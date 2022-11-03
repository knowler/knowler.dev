import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";

export const loader: LoaderFunction = async ({request}) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  return json({
		pages: await prisma.page.findMany({ take: 10 }),
  });
};

export default function PageList() {
  const { pages } = useLoaderData<typeof loader>();

  return (
    <article>
			<article-header>
				<h1>Pages</h1>
				<Link to="new">New Page</Link>
			</article-header>
			<table>
				<thead>
					<tr>
						<th>Title</th>
						<th>State</th>
						<th>Created At</th>
					</tr>
				</thead>
				<tbody>
					{pages.map(page => (
						<tr key={page.slug}>
							<td>
								<Link to={`edit/${page.id}`}>{page.title}</Link>
							</td>
							<td>{page.published ? <Link to={`/${page.slug}`}>Published</Link> : "Draft"}</td>
							<td>{new Date(page.createdAt).toString()}</td>
						</tr>
					))}
					<tr>
					</tr>
				</tbody>
			</table>
    </article>
  );
}
