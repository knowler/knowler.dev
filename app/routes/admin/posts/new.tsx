import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { Editor } from "~/components/editor";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";

enum FormAction {
	PUBLISH = "publish",
	DRAFT = "draft",
}

export const action: ActionFunction = async ({request}) => {
	await authOrLogin(request);

	const result = await getFormData(request, z.object({
		title: z.string(),
		slug: z.string(),
		description: z.string().optional(),
		content: z.string(),
		publishedAt: z.date().optional(),
		_action: z.nativeEnum(FormAction),
	}));

	if (!result.success) return json(result, 400);

	const {slug, title, description, content: markdown, publishedAt} = result.data;
	const published = result.data._action === "publish";
	const {html} = await parseMarkdown(markdown);

	const post = await prisma.post.create({
		data: {
			slug,
			title,
			description,
			published,
			html,
			markdown,
			publishedAt,
		},
	});

	return redirect(`/admin/post/edit/${post.id}`);
}

export default function NewPost() {
	const actionData = useActionData();

	return (
		<Form method="post">
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
				<Editor id="post-content" name="content" required />
			</form-field>
			<form-field>
				<label htmlFor="post-published-at">Published At</label>
				<input type="datetime-local" id ="post-published-at" name="publishedAt" />
			</form-field>
			<button name="_action" value="draft">Draft</button>
			<button name="_action" value="publish">Publish</button>
			<pre>
				<code>{JSON.stringify(actionData, null, 2)}</code>
			</pre>
		</Form>
	);
}
