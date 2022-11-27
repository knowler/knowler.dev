import { json, LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { notFound } from "~/utils";

export async function loader({request, params}: LoaderArgs) {
	await authOrLogin(request);

	const webmention = await prisma.webmention.findUnique({ where: { id: params.id } });

	if (!webmention) return notFound();

	return json(webmention);
};

export default function EditWebmention() {
	const {id} = useLoaderData<typeof loader>();

	return (
		<article>
			<h1>{id}</h1>
			<Form method="post" action={`/admin/webmentions/${id}/process`}>
				<button>Process</button>
			</Form>
		</article>
	);
}
