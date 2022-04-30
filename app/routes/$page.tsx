import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { parseMarkdown } from "~/md.server";
import { useAuthenticated } from '~/hooks';
import { octokit } from "~/octokit.server";
import proseStyles from '~/styles/prose.css';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: proseStyles},
];

export const meta: MetaFunction = ({ data }) => ({
  title: `${data.title} – Nathan Knowler`,
  description: data?.description,
});


interface PageContentQueryResponseData { repository: { object: { text: string; } } }
const pageContentQuery = `
  query page($expression: String!) {
    repository(name: "knowler.dev", owner: "knowler") {
      object(expression: $expression) {
        ... on Blob {
          text
        }
      }
    }
  }
`;
interface LoaderData { content: string; }
export const loader: LoaderFunction = async ({ params }) => {
  const data = await octokit.graphql<PageContentQueryResponseData>(
    pageContentQuery,
    { expression: `HEAD:content/pages/${params.page}.md` },
  );
  const { attributes, html } = await parseMarkdown(data.repository.object.text);

  return json<LoaderData>({
    content: html,
    ...attributes,
  });
};

export default function Page() {
  const params = useParams();
  const { content } = useLoaderData<LoaderData>();
  const isAuthenticated = useAuthenticated();

  return (
    <>
      <article className="prose" dangerouslySetInnerHTML={{ __html: content }} />
      <aside>
        {isAuthenticated ? (
          <Link to="edit">Edit this page</Link>
        ) : (
          <a
            href={`https://github.com/knowler/knowler.dev/blob/main/content/pages/${params.page}.md`}
          >
            Edit on GitHub
          </a>
        )}
      </aside>
    </>
  );
}
