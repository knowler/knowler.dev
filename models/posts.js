import kv from "~/kv.js";
import { getWebmention } from "./webmention.js";

export const postsCache = new Map(
	await Array.fromAsync(
		kv.list({ prefix: ["posts"] }),
		record => [record.value.slug, record.value],
	),
);

/**
 * @typedef {Object} Post
 * @param {string} id
 * @param {string} [slug]
 * @param {string} [title]
 * @param {string} [description]
 * @param {string} [html]
 * @param {boolean} published
 * @param {string} publishedAt
 */

export async function getPost(id) {
	const postRecord = await kv.get(["posts", id]);
	if (!postRecord.value) throw `post not found with id: ${id}`;

	return postRecord.value;
}

export async function getPostBySlug(
	slug,
	options = { withWebmentions: false },
) {
	if (postsCache.has(slug)) {
		console.log("has cached post");
		return postsCache.get(slug);
	}

	const idRecord = await kv.get(["postsBySlug", slug]);
	if (!idRecord.value) throw `post not found with slug: ${slug}`;
	const post = await getPost(idRecord.value);

	if (options.withWebmentions) {
		if ("webmentions" in post) {
			for (const [index, webmentionId] of post.webmentions.entries()) {
				post.webmentions[index] = await getWebmention(webmentionId);
			}
		} else post.webmentions = [];
	}

	return post;
}

export async function getPosts(options = {}) {
	let posts = [];
	if (postsCache.size > 0) {
		console.log("has cached posts");
		posts = Array.from(postsCache.values());
	} else {
		const iter = kv.list({ prefix: ["posts"] }, options);
		for await (const record of iter) posts.push(record.value);
	}

	posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

	return posts;
}

export async function createPost(data = {}) {
	const newPostData = {
		id: crypto.randomUUID(),
		...data,
	};

	// If this is a draft, don’t require a slug
	if (newPostData.published) {
		if (!newPostData.slug) throw "Slug is required for a published post";

		// Check if the post exists
		const existingPost = await kv.get(["postsBySlug", newPostData.slug]);

		if (existingPost.value) {
			throw `Post already exists with slug: ${newPostData.slug} (${existingPost.value})`;
		}

		newPostData.publishedAt ??= new Date().toISOString();
	}

	const post = await kv.set(["posts", newPostData.id], newPostData);
	// Associate slug
	if (newPostData.publishedAt) {
		await kv.set(["postsBySlug", newPostData.slug], newPostData.id);
	}

	return post.value;
}
