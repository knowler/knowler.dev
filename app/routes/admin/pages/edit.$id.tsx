import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { Editor } from "~/components/editor";
import { SlugField, TextareaField, TextField } from "~/components/forms";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";
import { invariant } from "~/utils";

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

	invariant(oldPage, "the page should have existed so idk how you got here.");

	const wasDraft = !oldPage.published;

	await prisma.page.update({
		where: { id: params.id },
		data: {
			slug,
			title,
			description,
			markdown,
			html,
			published: published === "on",
			publishedAt: published === "on"
				? wasDraft // if published is on, check if it was draft
					? new Date() // If it was a draft, then we need a new published date.
					: oldPage.publishedAt // Otherwise, we can just use the old one
				: null, // When published is off, then null out the value.
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
				<TextField label="Title" name="title" id="page-title" required defaultValue={page.title} />
				<SlugField label="Slug" name="slug" id="page-slug" required defaultValue={page.slug} />
				<TextareaField label="Description" name="description" id="page-description" defaultValue={page.description} />
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
