import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { winterpegDateTime } from "~/utils";

export const loader: LoaderFunction = async ({request}) => {
	await authOrLogin(request);

	return json({
		webmentions: await prisma.webmention.findMany({take: 10}),
	});
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
								<dt>Source</dt>
								<dd>{webmention.source}</dd>
							</dl>
							<dl>
								<dt>Target</dt>
								<dd>{webmention.target}</dd>
							</dl>
						</li>
					))}
				</ol>
			</section>
		</article>
	);
}
