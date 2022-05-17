import { CachedPage } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";

interface LoaderData {
  pages: Pick<CachedPage, "slug" | "title">[];
}
export const loader: LoaderFunction = async ({request}) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

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
