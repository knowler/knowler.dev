import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";

enum FormAction {
	PUBLISH = "publish",
	DRAFT = "draft",
}

export const action: ActionFunction = async ({request}) => {
	await authOrLogin(request);

	const result = await getFormData(request, z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		content: z.string(),
		_action: z.nativeEnum(FormAction),
	}));

	if (!result.success) return json({success: false}, 400);

	const {slug, title, description, content: markdown, _action: action} = result.data;

	const {html} = await parseMarkdown(markdown);

	const page = await prisma.page.create({
		data: {
			slug,
			title,
			description: description || null,
			markdown,
			html,
			published: action === "publish",
		},
	});

	return redirect(`/admin/pages/edit/${page.slug}`);
}

export const loader: LoaderFunction = async ({request}) => {
	await authOrLogin(request);

	return json({});
}

export default function NewPage() {
	return (
		<Form method="post">
			<h1>New Page</h1>
			<form-field>
				<label htmlFor="post-title">Title</label> 
				<input id="post-title" name="title" required />
			</form-field>
			<form-field>
				<label htmlFor="post-slug">Slug</label> 
				<input id="post-slug" name="slug" required />
			</form-field>
			<form-field>
				<label htmlFor="post-description">Description</label> 
				<textarea id="post-description" name="description" />
			</form-field>
			<form-field>
				<label htmlFor="post-content">Content</label> 
				<textarea id="post-content" name="content" required />
			</form-field>
			<div>
				<button name="_action" value="draft">Draft</button> <button name="_action" value="publish">Publish</button>
			</div>
		</Form>
	);
}
