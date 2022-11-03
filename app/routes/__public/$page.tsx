import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useAuthenticated } from "~/hooks";
import { prisma } from "~/db.server";
import { notFound } from "remix-utils";
import { getSeoMeta } from "~/seo";

export const meta: MetaFunction = ({ data }) => getSeoMeta({
	title: data.page.title,
	description: data.page?.description,
});

export const loader: LoaderFunction = async ({ params }) => {
  let page = await prisma.page.findFirst({
		where: {
			slug: params.page,
			published: true,
		},
  });

  if (!page) throw notFound("Page not found");

  return json({ page });
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();
  const isAuthenticated = useAuthenticated();

  return (
    <>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <aside className="edit-link">
        {isAuthenticated ? (
          <Link to={`/admin/pages/edit/${page.id}`}>Edit this page</Link>
        ) : (
          <a
            href={`https://github.com/knowler/knowler.dev/blob/main/content/pages/${page.slug}.md`}
          >
            Edit on GitHub
          </a>
        )}
      </aside>
    </>
  );
}
