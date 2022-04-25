import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction} from "@remix-run/node";
import {
  json
} from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { parseMarkdown } from "~/md.server";
import { octokit } from "~/octokit.server";
import proseStyles from '~/styles/prose.css';

interface Post {
  title: string;
  description?: string;
  body: string;
}

interface LoaderData {
  post: Post;
}

async function getPost(slug: string): Promise<Post> {
  try {
    const data: { repository: { object: { text: string } } } =
      await octokit.graphql(
        `
      query gardenPost($expression: String!) {
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
          expression: `HEAD:content/garden/${slug}.md`,
        }
      );
    const { attributes, html } = await parseMarkdown(
      data.repository.object.text
    );
    return {
      title: attributes.title,
      description: attributes?.description,
      body: html,
    };
  } catch (error) {
    throw new Error("Issue parsing the markdown content");
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  try {
    return json(
      {
        post: await getPost(
          z
            .string()
            .regex(/^[a-z0-9\-]*$/) // idk — security
            .parse(params.slug)
        ),
      }, {
        headers: {'Cache-Control': 'public, max-age=60'}
      }
    );
  } catch (error) {
    throw new Response("Not found", { status: 404 });
  }
};

export const headers: HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export const meta: MetaFunction = ({ data }) => {
  const { post } = data as LoaderData;

  return {
    title: `${post.title} – Nathan Knowler`,
    description: post?.description,
  };
};

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet', href: proseStyles,
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
];

export default function GardenPost() {
  const { post } = useLoaderData<LoaderData>();

  return <article className="prose" dangerouslySetInnerHTML={{ __html: post.body }} />;
}

export function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <h1>
      {status}: {statusText}
    </h1>
  );
}
