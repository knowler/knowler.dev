import { ActionFunction, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/db.server";

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();

	const content = formData.get('content');

	if (!content || typeof content !== "string") throw "No content provided";

	const post = await prisma.microBlogPost.create({ data: { content } });

	return json({ post });
}

export default function MicroblogPost() {
	return (
		<Form method="post">
			<label htmlFor="post-content">Content</label>
			<textarea name="content" id="post-content" required />
			<button>Post</button>
		</Form>
	);
}
