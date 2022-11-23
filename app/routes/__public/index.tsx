import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getSeoMeta } from "~/seo";

export const meta: MetaFunction = () => getSeoMeta({
  title: "Home",
});

export const loader: LoaderFunction = async () => {
	const webmentions = await prisma.webmention.findMany({
		where: {
			target: 'https://knowler.dev',
			approved: true,
		},
	});

	return json({ webmentions });
}

export default function Index() {
	const {webmentions} = useLoaderData<typeof loader>();

  return (
		<article className="h-entry prose has-links">
			<h1>I am Nathan Knowler</h1>
			<p>
				Welcome to my website. I’m originally from Vancouver, however, I now
				live in Winnipeg and work remotely as a Senior Frontend Developer at{" "}
				<a href="https://wearekettle.com">Kettle</a>.
			</p>
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
