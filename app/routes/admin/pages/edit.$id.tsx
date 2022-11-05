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
		title: z.string(),
		slug: z.string(),
		description: z.string().optional(),
		content: z.string(),
		published: z.string().optional(),
	}));

	if (!result.success) return json({success: false}, 400);

	const {title, slug, description, content: markdown, published} = result.data;
	const {html} = await parseMarkdown(markdown);

	const oldPage = await prisma.page.findUnique({where: {id: params.id}, select: {published: true, publishedAt: true}});

	await prisma.page.update({
		where: { id: params.id },
		data: {
			slug,
			title,
			description,
			markdown,
			html,
			published: published === "on",
			publishedAt: published === "on" ? !oldPage?.published ? new Date().toISOString() : oldPage?.publishedAt : null,
		},
	});

	return json({success: true});
}

export const loader: LoaderFunction = async ({request, params}) => {
	await authOrLogin(request);

	const page = await prisma.page.findUnique({
		where: {
			id: params.id,
		},
	});

	if (!page) return json({}, 404);

	return json({ page });
}

export default function EditPage() {
	const {page} = useLoaderData<typeof loader>();

	return (
		<>
			<Form method="post">
				<h1>Edit "{page.title}"</h1>
				<form-field>
					<label htmlFor="page-title">Title</label>
					<input id="page-title" name="title" required defaultValue={page.title} />
				</form-field>
				<form-field>
					<label htmlFor="page-slug">Slug</label>
					<input id="page-slug" name="slug" required defaultValue={page.slug} />
				</form-field>
				<form-field>
					<label htmlFor="page-description">Description</label>
					<textarea id="page-description" name="description" defaultValue={page.description} />
				</form-field>
				<form-field>
					<label htmlFor="page-content">Content</label>
					<Editor id="page-content" name="content" required defaultValue={page.markdown} />
				</form-field>
				<label>
					Publish <input type="checkbox" name="published" defaultChecked={page.published} />
				</label>
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