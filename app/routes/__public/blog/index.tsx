import { CachedBlogPost } from "@prisma/client";
import type { HeadersFunction, LinksFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getSeo } from "~/seo";
import blogStyles from "~/styles/blog.css";

const [seoMeta, seoLinks] = getSeo({title: 'Blog'});

export const meta: MetaFunction = () => seoMeta;

interface LoaderData {
  posts: CachedBlogPost[];
}

export const links: LinksFunction = () => [
	...seoLinks,
	{rel: 'stylesheet', href: blogStyles},
]

export const headers: HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export const loader: LoaderFunction = async () => {
	const posts = await prisma.cachedBlogPost.findMany({
		take: 10,
		orderBy: {
			publishedAt: "desc",
		},
	});

  return json<LoaderData>(
    { posts },
    {
      headers: {'Cache-Control': 'public, s-maxage=60'},
    }
  );
};

export default function BlogIndex() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <ol role="list" reversed>
      {posts.map((post) => (
        <li key={post.slug}>
					<article>
						<hgroup>
							<h2><Link to={post.slug}>{post.title}</Link></h2>
							<time dateTime={post.publishedAt}>{new Date(post.publishedAt).toDateString()}</time>
							{post.description ? <p>{post.description}</p> : undefined}
						</hgroup>
					</article>
        </li>
      ))}
    </ol>
  );
}
