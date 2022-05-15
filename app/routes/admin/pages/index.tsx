import { CachedPage } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";

interface LoaderData {
  pages: Pick<CachedPage, "slug" | "title">[];
}
export const loader: LoaderFunction = async () => {
  return json<LoaderData>({
    pages: await prisma.cachedPage.findMany({
      select: {
        slug: true,
        title: true,
      },
    }),
  });
};

export default function PageList() {
  const { pages } = useLoaderData<LoaderData>();

  return (
    <main>
      <h1>Pages</h1>
      <ul className="has-links">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link to={`edit/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
