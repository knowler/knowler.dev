import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { winterpegDateTime } from "~/utils";

export async function loader({request}: LoaderArgs) {
	await authOrLogin(request);

	const webmentions = await prisma.webmention.findMany({take: 10});

	if (!webmentions) throw "Not found";

	return json({ webmentions });
}

export default function WebmentionsIndex() {
	const {webmentions} = useLoaderData<typeof loader>();

	return (
		<article className="flow" style={{'--space': 'var(--size-4)'}}>
			<article-header>
				<h1>Webmentions</h1>
			</article-header>
			<section className="flow" style={{'--space': 'var(--size-4)'}}>
				<h2>Inbox</h2>
				<ol className="card-grid">
					{webmentions.map(webmention => (
						<li key={webmention.target} className="card flow">
							<time dateTime={webmention.createdAt}>{winterpegDateTime(webmention.createdAt)}</time>
							<dl>
								<dt>Title</dt>
								<dd>{webmention.title}</dd>
								<dt>Author</dt>
								<dd>{webmention.author}</dd>
								<dt>Source</dt>
								<dd><a href={webmention.source}>{webmention.source}</a></dd>
								<dt>Target</dt>
								<dd><a href={webmention.target}>{webmention.target}</a></dd>
							</dl>
							<a href={`webmentions/${webmention.id}/edit`}>Edit</a>
						</li>
					))}
				</ol>
			</section>
		</article>
	);
}
