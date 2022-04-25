import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useMatches, useParams } from "@remix-run/react";
import { parseMarkdown } from "~/md.server";
import { octokit } from "~/octokit.server";

export const meta: MetaFunction = ({ data }) => ({
  title: `${data.title} – Nathan Knowler`,
  description: data?.description,
});

interface LoaderData {
  content: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  const data: { repository: { object: { text: string } } } =
    await octokit.graphql(
      `
    query page($expression: String!) {
      repository(name: "knowlerkno.ws", owner: "knowler") {
        object(expression: $expression) {
          ... on Blob {
            text
          }
        }
      }
    }
  `,
      {
        expression: `HEAD:content/pages/${params.page}.md`,
      }
    );
  const { attributes, html } = await parseMarkdown(data.repository.object.text);

  return json<LoaderData>({
    content: html,
    ...attributes,
  });
};

function useAuthenticated() {
  return useMatches().find((match) => match.id === "root")?.data
    ?.isAuthenticated;
}

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
            href={`https://github.com/knowler/knowlerkno.ws/blob/main/content/pages/${params.page}.md`}
          >
            Edit on GitHub
          </a>
        )}
      </aside>
    </>
  );
}
