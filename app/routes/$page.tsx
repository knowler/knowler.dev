import { LoaderFunction, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

export default function Uses() {
  const { content } = useLoaderData<LoaderData>();

  return <article dangerouslySetInnerHTML={{ __html: content }} />;
}
