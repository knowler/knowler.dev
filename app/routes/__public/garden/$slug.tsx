import type { LinksFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { parseMarkdown } from "~/md.server";
import { octokit } from "~/octokit.server";

export const meta: MetaFunction = ({ data }) => {
  const { description, title } = data as LoaderData;
  return { title: `${title} – Nathan Knowler`, description };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
];

interface GardenPostQueryResponseData {repository: {object: {text: string}}};
const gardenPostQuery = `
  query gardenPost($expression: String!) {
    repository(name: "knowler.dev", owner: "knowler") {
      object(expression: $expression) {
        ... on Blob {
          text
        }
      }
    }
  }
`;
interface LoaderData { title: string; description?: string; body: string; }
export const loader: LoaderFunction = async ({ params }) => {
  const data = await octokit.graphql<GardenPostQueryResponseData>(
    gardenPostQuery,
    { expression: `HEAD:content/garden/${params.slug}.md` },
  );
  const { attributes, html } = await parseMarkdown(data.repository.object.text);

  return json({
    title: attributes.title,
    description: attributes?.description,
    body: html,
  });
};

export default function GardenPost() {
  const { body } = useLoaderData<LoaderData>();

  return <article className="prose" dangerouslySetInnerHTML={{ __html: body }} />;
}
