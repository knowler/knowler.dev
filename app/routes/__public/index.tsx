import { json, LoaderArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getSeoMeta } from "~/seo";
import { winterpegDateTime } from "~/utils";

export const meta: MetaFunction = () => getSeoMeta({
	title: "Home",
});

export async function loader({ }: LoaderArgs) {
	const latestPosts = await prisma.post.findMany({
		where: { published: true },
		orderBy: { publishedAt: "desc" },
		take: 3,
	});

	const webmentions = await prisma.webmention.findMany({
		where: {
			target: 'https://knowler.dev',
			approved: true,
		},
	});

	return json({
		webmentions,
		latestPosts,
	});
}

export default function Index() {
	const { webmentions, latestPosts } = useLoaderData<typeof loader>();

	return (
		<article className="h-entry prose has-links">
			<h1>I am Nathan Knowler</h1>
			<p>
				Welcome to my website. I’m originally from Vancouver, however, I now
				live in Winnipeg and work remotely as a Senior Frontend Developer at{" "}
				<a href="https://wearekettle.com">Kettle</a>.
			</p>
			{latestPosts ? (
				<section>
					<h2>Latest blog posts</h2>
					<ol reversed role="list" style={{ listStyle: 'none', paddingInlineStart: 0 }}>
						{latestPosts.map(post => (
							<li key={post.id}>
								<article>
									<h3><a href={`/blog/${post.slug}`} rel="bookmark">{post.title}</a></h3>
									<p><time dateTime={post.publishedAt}>{new Date(post.publishedAt).toDateString()}</time></p>
									<p>{post.description}</p>
								</article>
							</li>
						))}
					</ol>
					<p><a href="/blog">See more blog posts</a></p>
				</section>
			) : null}
			{webmentions?.length > 0 ? (
				<aside aria-labelledby="webmentionsLabel">
					<details>
						<summary>{webmentions.length} <span id="webmentionsLabel">Webmention{webmentions.length > 1 ? "s" : ""}</span></summary>
						<ol>
							{webmentions.map(webmention => (
								<li key={webmention.id}><a href={webmention.source}>“{webmention.title}” by {webmention.author}</a></li>
							))}
						</ol>
					</details>
				</aside>
			) : null}
		</article>
	);
}
