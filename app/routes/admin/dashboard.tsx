import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => ({
  title: "Dashboard – Nathan Knowler",
});

export const loader: LoaderFunction = async ({ request }) => {
  const { profile } = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return json({
    name: profile.displayName,
		recentlyUpdated: await prisma.page.findMany({
			take: 3,
			where: {
				updatedAt: {
					// Get updates from the last two days.
					gte: new Date(new Date().getDate() - 2),
				},
			},
			orderBy: {
				updatedAt: 'desc',
			}
		}),
  });
};

export default function Dashboard() {
  const { name, recentlyUpdated } = useLoaderData<typeof loader>();

	return (
		<article className="flow" style={{"--space": "var(--size-4)"}}>
			<h1>Welcome to the dashboard, {name}!</h1>
			<section className="flow" style={{"--space": "var(--size-4)"}}>
				<h2>Recently Updated</h2>
				<ol role="list" className="card-grid">
					{recentlyUpdated.map(page => (
						<li key={page.id} className="card">
							<article className="flow">
								<h3>{page.title}</h3>
							</article>
						</li>
					))}
				</ol>
			</section>
		</article>
	);
}
