import kv from "~/kv.js";

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

export async function getPostBySlug(slug) {
	const idRecord = await kv.get(["postsBySlug", slug]);
	if (!idRecord.value) throw `post not found with slug: ${slug}`;
	const post = await getPost(idRecord.value);

	return post;
}

export async function getPosts(options = {}) {
	const posts = [];
	const iter = kv.list({ prefix: ["posts"] }, options);
	for await (const record of iter) posts.push(record.value);

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

export class Posts {
	hasList = false;
	cache = new Map();

	async get(slug) {
		if (this.cache.has(slug)) {
			console.log(`has cached post for slug: ${slug}`);
			return this.cache.get(slug);
		}

		console.log(`reading post for slug: ${slug}`);

		const slugRecord = await kv.get(["postsBySlug", slug]);
		if (!slugRecord.value) throw `post not found with slug: ${slug}`;

		const postRecord = await kv.get(["posts", slugRecord.value]);
		if (!postRecord.value) throw `post not found for id: ${slugRecord.value}`;

		this.cache.set(slug, postRecord.value);

		return postRecord.value;
	}

	async list() {
		if (!this.hasList) {
			console.log("populating posts cache");
			for await (const record of kv.list({ prefix: ["posts"] })) {
				this.cache.set(record.value.slug, record.value);
			}
			this.hasList = true;
		} else console.log("already has post list");

		const posts = Array.from(this.cache.values());

		posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

		return posts;
	}
}
