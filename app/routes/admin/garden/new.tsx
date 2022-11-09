import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { Editor } from "~/components/editor";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";

export const action: ActionFunction = async ({request}) => {
	await authOrLogin(request);

	const result = await getFormData(request, z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		content: z.string(),
	}));

	if (!result.data) return json(result, 400);

	const {slug, title, description, content: markdown} = result.data;
	const {html} = await parseMarkdown(markdown);

	const post = await prisma.gardenPost.create({
		data: {
			slug,
			title,
			description,
			html,
			markdown,
		},
	});

	return redirect(`/admin/garden/edit/${post.id}`);
}

export const loader: LoaderFunction = async ({request}) => {
	await authOrLogin(request);

	return json({});
}

export default function NewGardenPost() {

	return (
		<Form method="post">
			<form-field>
				<label htmlFor="post-slug">Slug</label>
				<input id="post-slug" name="slug" required />
			</form-field>
			<form-field>
				<label htmlFor="post-title">Title</label>
				<input id="post-title" name="title" required />
			</form-field>
			<form-field>
				<label htmlFor="post-description">Description</label>
				<textarea id="post-description" name="description" />
			</form-field>
			<form-field>
				<label htmlFor="post-content">Content</label>
				<Editor id="post-content" name="content" required />
			</form-field>
			<button>Create</button>
		</Form>
	);
}
