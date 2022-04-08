import fs from "fs/promises";
import path from "path";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { parseMarkdown } from "~/md.server";

interface Post {
  title: string;
  description?: string;
  body: string;
}

interface LoaderData {
  post: Post;
}

async function getPost(slug: string): Promise<Post> {
  const file = (
    await fs.readFile(path.join(__dirname, `../content/garden/${slug}.mdx`))
  ).toString();

  try {
    const { attributes, html } = await parseMarkdown(file);
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
