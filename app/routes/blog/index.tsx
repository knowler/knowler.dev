import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import parseFrontMatter from "front-matter";
import { octokit } from "~/octokit.server";

interface Post {
  slug: string;
  title: string;
  date: string;
}

interface LoaderData {
  posts: Post[];
}

async function getPosts() {
  return octokit
    .graphql(
      `
    {
      repository(owner: "knowler", name: "knowlerkno.ws") {
        object(expression: "HEAD:content/blog") {
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
    `
    )
    .then((data) =>
      data.repository.object.entries
        .map((entry) => {
          const { attributes } = parseFrontMatter(entry.object.text);
          return {
            slug: entry.name.replace(entry.extension, ""),
            ...attributes,
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    );
}

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ posts: (await getPosts()).reverse() });
};

export default function BlogIndex() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <ol reversed>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link to={post.slug}>{post.title}</Link>
        </li>
      ))}
    </ol>
  );
}
