import type { HeadersFunction, LoaderArgs, MetaFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getSeo } from "~/seo";

const [seoMeta] = getSeo({title: 'Blog'});

const css = String.raw;

const blogStyles = css`
.blog ol {
	list-style: none;
	padding-inline-start: 0;
	display: grid;
	gap: 1.5rem;
	max-inline-size: 64rem;
}

.blog li {
	grid-column: span 6;
}

.blog hgroup {
	display: grid;
	gap: 0.25rem;
}

.blog h2 {
	font-size: 1.25em;
	font-weight: 300;
	font-variation-settings: 'wdth' 110;
	letter-spacing: 0.01em;
	margin-block: 0;
}

.blog p {
	margin-block-start: 0.25em;
	margin-block-end: 0;
	max-inline-size: 48ch;
}

.blog time {
	font-style: italic;
}
`;

export const meta: MetaFunction = () => seoMeta;

export const headers: HeadersFunction = ({loaderHeaders}) => loaderHeaders;

export async function loader({}: LoaderArgs) {
	const posts = await prisma.post.findMany({
		take: 10,
		orderBy: { publishedAt: "desc" },
		where: { published: true },
	});

  return json(
    { posts },
    {
      headers: {'Cache-Control': 'public, s-maxage=60'},
    }
  );
};

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
		<article className="blog">
			<style dangerouslySetInnerHTML={{__html: blogStyles}} />
			<h1>Blog</h1>
			<ol role="list" reversed>
				{posts.map((post) => (
					<li key={post.slug}>
						<article>
							<hgroup>
								<h2><Link to={post.slug}>{post.title}</Link></h2>
								<time dateTime={post.publishedAt}>{new Date(post.publishedAt).toDateString()}</time>
							</hgroup>
							{post.description ? <p>{post.description}</p> : undefined}
						</article>
					</li>
				))}
			</ol>
		</article>
  );
}
