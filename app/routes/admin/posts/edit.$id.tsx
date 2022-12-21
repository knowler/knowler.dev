import { ActionFunction, json, LoaderArgs, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";
import { authOrLogin } from "~/auth.server";
import { Editor } from "~/components/editor";
import { SlugField, TextareaField, TextField } from "~/components/forms";
import { VisualDebugger } from "~/components/visual-debugger";
import { prisma } from "~/db.server";
import { parseMarkdown } from "~/md.server";
import { invariant, omit } from "~/utils";

export const action: ActionFunction = async ({request, params}) => {
	await authOrLogin(request);

	const result = await getFormData(request, z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		content: z.string(),
		published: z.string().optional(),
	}));

	if (!result.success) return json(result, 400);

	const {slug, title, description, content: markdown, published} = result.data;
	const {html} = await parseMarkdown(markdown);

	const oldPost = await prisma.post.findUnique({
		where: {id: params.id},
		select: {published: true, publishedAt: true},
	});

	invariant(oldPost, "the post should have existed so idk how you got here");

	const wasDraft = !oldPost.published;

	await prisma.post.update({
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
					: oldPost.publishedAt // Otherwise, we can just use the old one
				: null, // When published is off, then null out the value.
		}
	})

	return json({success: true});
}

export async function loader({request, params}: LoaderArgs) {
	await authOrLogin(request);
	const post = await prisma.post.findUnique({where: { id: params.id }});

	if (!post) return json({}, 404);

	return json({ post: omit(post, 'html') });
}

export default function PostEditor() {
	const {post} = useLoaderData<typeof loader>();

	return (
		<>
			<Form method="post">
				<h1>Edit "{post.title}"</h1>
				<TextField label="Title" name="title" id="post-title" required defaultValue={post.title} />
				<SlugField label="Slug" name="slug" id="post-slug" from="post-title" required defaultValue={post.slug} />
				<TextareaField label="Description" name="description" id="post-description" defaultValue={post.description} />
				<form-field>
					<label htmlFor="post-content">Content</label>
					<Editor id="post-content" name="content" required defaultValue={post.markdown} />
				</form-field>
				<label>
					Publish <input type="checkbox" name="published" defaultChecked={post.published} />
				</label>
				<button>Update</button>
				<VisualDebugger code={post} />
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
