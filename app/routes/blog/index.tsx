import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import parseFrontMatter from 'front-matter';
import { octokit } from "~/octokit.server";

interface Post {
  slug: string;
  title: string;
  date: string;
}

interface LoaderData {
  posts: Post[];
}

let posts: Post[];

export const loader: LoaderFunction = async () => {
  const {data: files} = await octokit.rest.repos.getContent({
    owner: 'knowler',
    repo: 'knowlerkno.ws',
    path: 'content/blog'
  });

  if (!posts) {
    posts = await Promise.all(files.map(async file => {
      const {data: markdown} = await octokit.rest.repos.getContent({
        mediaType: {
          format: 'raw',
        },
        owner: 'knowler',
        repo: 'knowlerkno.ws',
        path: file.path,
      });
      const {attributes} = parseFrontMatter(markdown);

      return {
        slug: file.name.replace(/\.md$/, ''),
        ...attributes,
      };
    }));
  }

  return json<LoaderData>({posts});
}

export default function BlogIndex() {
  const {posts} = useLoaderData<LoaderData>();

  return (
    <ol reversed>
      {posts.map(post => <li key={post.slug}><Link to={post.slug}>{post.title}</Link></li>)}
    </ol>
  );
}
