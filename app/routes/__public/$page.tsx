import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { useAuthenticated } from "~/hooks";
import proseStyles from "~/styles/prose.css";
import { prisma } from "~/db.server";
import { CachedPage } from "@prisma/client";
import { notFound } from "remix-utils";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: proseStyles },
];

export const meta: MetaFunction = ({ data }) => ({
  title: `${data.page.title} – Nathan Knowler`,
  description: data.page?.description,
});

interface LoaderData {
  page: CachedPage;
}
export const loader: LoaderFunction = async ({ params }) => {
  let page = await prisma.cachedPage.findUnique({
    where: { slug: params.page },
  });

  if (!page) throw notFound("Page not found");

  return json<LoaderData>({ page });
};

export default function Page() {
  const { page } = useLoaderData<LoaderData>();
  const isAuthenticated = useAuthenticated();

  return (
    <>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      <aside>
        {isAuthenticated ? (
          <Link to={`/admin/pages/edit/${page.slug}`}>Edit this page</Link>
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
