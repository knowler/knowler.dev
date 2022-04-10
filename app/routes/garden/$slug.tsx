import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { parseMarkdown } from "~/md.server";
import { Octokit } from "octokit";

interface Post {
  title: string;
  description?: string;
  body: string;
}

interface LoaderData {
  post: Post;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN as string,
});

async function getPost(slug: string): Promise<Post> {
  try {
    const {data} = await octokit.rest.repos.getContent({
      mediaType: {
        format: "raw",
      },
      owner: "knowler",
      repo: "knowlerkno.ws",
      path: `content/garden/${slug}.md`,
    });
    const { attributes, html } = await parseMarkdown(data);
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
    return json({
      post: await getPost(
        z
          .string()
          .regex(/^[a-z0-9\-]*$/) // idk — security
          .parse(params.slug)
      ),
    });
  } catch (error) {
    throw new Response("Not found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  const { post } = data as LoaderData;

  return {
    title: `${post.title} – Nathan Knowler`,
    description: post?.description,
  };
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
];

export default function GardenPost() {
  const { post } = useLoaderData<LoaderData>();

  return <article dangerouslySetInnerHTML={{ __html: post.body }} />;
}

export function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <h1>
      {status}: {statusText}
    </h1>
  );
}
