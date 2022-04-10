import {json, LoaderFunction, MetaFunction} from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { parseMarkdown } from "~/md.server";
import {octokit} from '~/octokit.server';

interface Post {
  title: string;
  body: string;
  date: string;
  tags: string[];
}

interface LoaderData {
  post: Post;
}

async function getPost(slug: string): Promise<Post> {
  try {
    const {data} = await octokit.rest.repos.getContent({
      mediaType: {
        format: "raw",
      },
      owner: "knowler",
      repo: "knowlerkno.ws",
      path: `content/blog/${slug}.md`,
    });
    const { attributes, html } = await parseMarkdown(data);
    return {
      title: attributes.title,
      date: attributes.date,
      tags: attributes?.tags ?? [],
      body: html,
    };
  } catch (error) {
    throw new Error("Issue parsing the markdown content");
  }
}

export const loader: LoaderFunction = async ({params}) => {
  try {
    return json<LoaderData>({
      post: await getPost(
        z
          .string()
          .regex(/^[a-z0-9\-]*$/) // idk — security
          .parse(params.slug)
      ),
    });
  } catch(error) {
    throw new Response('Not found', { status: 404 });
  }
}

export const Meta: MetaFunction = ({data}) => {
  const {post} = data as LoaderData;

  return {
    title: `${post.title} – Nathan Knowler`,
  };
}

export default function BlogPost() {
  const {post} = useLoaderData<LoaderData>();

  return (
    <article dangerouslySetInnerHTML={{__html: post.body}} />
  );
}

export function CatchBoundary() {
  const { status, statusText } = useCatch();

  return (
    <h1>
      {status}: {statusText}
    </h1>
  );
}