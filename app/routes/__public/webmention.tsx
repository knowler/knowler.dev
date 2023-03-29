import { ActionFunction, json, LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { prisma } from "~/db.server";
import { getSeoMeta } from "~/seo";
import webmentionFormStyles from './webmention.css';

export const meta: MetaFunction = () => getSeoMeta({title: 'Webmention'});

export const links: LinksFunction = () => [
	{rel: "stylesheet", href: webmentionFormStyles},
];

export const action: ActionFunction = async ({ request }) => {
	// Confirm that the source and target are included and both are URLs
	// which are not the same. TODO: confirm that the content for both
	// pages are valid
	const result = await getFormData(request,
		z.object({
			robotName: z.string().max(0).optional(),
			source: z.string().url(),
			target: z.string().url(),
		}).refine(data => data.source !== data.target, {
			message: "source and target cannot be the same",
			path: ["source", "target"],
		}),
	);

	if (!result.success) return json({ result }, 400);

	const {source, target} = result.data;
	await prisma.webmention.create({ data: { source, target } })

	return json({ success: true }, 202);
}

export default function Webmention() {
	const actionData = useActionData<typeof action>();

	return (
		<article className="prose">
			<h1>Webmention</h1>
			<p>If the platform you are using doesn’t already support Webmentions, then you can use this form to manually send one for content you link to on my website.</p>
			<Form method="post" name="webmention">
				<form-field>
					<label htmlFor="source">Source</label>
					<p id="source-hint" className="hint">The URL for your content.</p>
					<input type="url" id="source" name="source" required aria-describedby="source-hint" />
				</form-field>
				<form-field>
					<label htmlFor="target" style={{ display: 'block', fontWeight: 500 }}>Target</label>
					<p id="target-hint" className="hint">The URL for my content.</p>
					<input type="url" id="target" name="target" required aria-describedby="target-hint" />
				</form-field>
				<input type="text" name="robotName" hidden />
				<button>Send Webmention</button>
				{actionData?.result ? <pre><code>{JSON.stringify(actionData.result, null, 2)}</code></pre> : null}
			</Form>
		</article>
	);
}
