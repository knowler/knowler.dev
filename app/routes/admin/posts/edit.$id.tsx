import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { Editor } from "~/components/editor";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";

export const action: ActionFunction = async ({request, params}) => {
	await authOrLogin(request);

	const result = await getFormData(request, z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		content: z.string(),
		published: z.string().optional(),
		publishedAt: z.date().optional(),
	}));

	if (!result.success) return json(result, 400);

	const {slug, title, description, content: markdown, published, publishedAt} = result.data;
	const {html} = await parseMarkdown(markdown);

	const oldPage = await prisma.post.findUnique({
		where: {id: params.id},
		select: {published: true},
	});

	await prisma.post.update({
		where: { id: params.id },
		data: {
			slug,
			title,
			description,
			markdown,
			html,
			published: published === "on",
			publishedAt: !oldPage?.published && !publishedAt ? new Date().toUTCString() : publishedAt,
		}
	})

	return json({success: true});
}

export const loader: LoaderFunction = async ({request, params}) => {
	await authOrLogin(request);
	const post = await prisma.post.findUnique({where: { id: params.id }});

	if (!post) return json({}, 404);

	return json({ post });
}

export default function PostEditor() {
	const {post} = useLoaderData<typeof loader>();

	return (
		<>
			<Form method="post">
				<h1>Edit "{post.title}"</h1>
				<form-field>
					<label htmlFor="post-title">Title</label>
					<input id="post-title" name="title" required defaultValue={post.title} />
				</form-field>
				<form-field>
					<label htmlFor="post-slug">Slug</label>
					<input id="post-slug" name="slug" required defaultValue={post.slug} />
				</form-field>
				<form-field>
					<label htmlFor="post-description">Description</label>
					<textarea id="post-description" name="description" defaultValue={post.description} />
				</form-field>
				<form-field>
					<label htmlFor="post-content">Content</label>
					<Editor id="post-content" name="content" required defaultValue={post.markdown} />
				</form-field>
				<label>
					Publish <input type="checkbox" name="published" defaultChecked={post.published} />
				</label>
				<form-field>
					<label htmlFor="post-published-at">Published At</label>
					<input type="datetime-local" id ="post-published-at" name="publishedAt" />
				</form-field>
				<button>Update</button>
			</Form>
			<Form method="post" action="delete" name="deletePage">
				<button type="button" name="deleteButton">Delete</button>
				<dialog name="confirmDeleteModal">
					<p>Are you sure?</p>
					<button>Delete</button>
				</dialog>
				<script dangerouslySetInnerHTML={{
					__html: `
const {deleteButton, confirmDeleteModal} = document.forms.deletePage.children;
deleteButton.addEventListener('click', () => confirmDeleteModal.showModal());
					`}} 
				/>
			</Form>
		</>
	);
}
