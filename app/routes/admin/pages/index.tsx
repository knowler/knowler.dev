import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import parseFrontMatter from "front-matter";
import { octokit } from "~/octokit.server";

interface PagesQueryResponseData {
  repository: {
    object: {
      entries: {
        name: string;
        extension: string;
        object: {
          text: string;
        };
      }[];
    };
  };
}
const pagesQuery = `
  query pages {
    repository(name: "knowler.dev", owner: "knowler") {
      object(expression: "HEAD:content/pages") {
        ... on Tree {
          entries {
            name
            extension
            object {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }
`;
interface Page {
  slug: string;
  title: string;
  description?: string;
}
async function getPages(): Promise<Page[]> {
  const data = await octokit.graphql<PagesQueryResponseData>(pagesQuery);
  return data.repository.object.entries?.map((entry) => {
    const { attributes } = parseFrontMatter<Omit<Page, "slug">>(
      entry.object.text
    );
    return {
      slug: entry.name.replace(entry.extension, ""),
      ...attributes,
    };
  });
}

interface LoaderData {
  pages: Page[];
}
export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ pages: await getPages() });
};

export default function PageList() {
  const { pages } = useLoaderData<LoaderData>();

  return (
    <>
      <h1>Pages</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.slug}>
            <Link to={`edit/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
