import kv from "~/kv.js";

const IS_KV_REGION = Deno.env.get("KV_REGION") === Deno.env.get("DENO_REGION");

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
	channel = new BroadcastChannel("posts");

	constructor() {
		if (IS_KV_REGION) {
			this.channel.addEventListener("message", async event => {
				const { action, payload } = event.data;
				switch (action) {
					case "list":
						if (!this.hasList) await this.fetchList();
						this.channel.postMessage({ action: "response-list", payload: this.cache });
						break;
					case "get":
						if (!this.cache.has(payload)) await this.fetchPost(payload);
						this.channel.postMessage({ action: "response-get", payload: this.cache.get(payload) })
					break;
				}
			});
		}
	}

	async get(slug) {
		if (!this.cache.has(slug)) await this.fetchPost();
		else console.log(`has cached post for slug: ${slug}`);

		return this.cache.get(slug);
	}

	async fetchPost(slug) {
		if (IS_KV_REGION) {
			console.log(`reading post for slug: ${slug}`);
			const slugRecord = await kv.get(["postsBySlug", slug]);
			if (!slugRecord.value) throw `post not found with slug: ${slug}`;

			const postRecord = await kv.get(["posts", slugRecord.value]);
			if (!postRecord.value) throw `post not found for id: ${slugRecord.value}`;

			this.cache.set(slug, postRecord.value);
		} else {
			console.log("fetching cached post from read region");
			await new Promise(resolve => {
				this.channel.postMessage({ action: "get", payload: slug });
				this.channel.addEventListener("message", event => {
					const { action, payload } = event.data;
					if (action === "response-get" && slug === payload.slug) {
						this.cache.set(slug, payload);
						resolve();
					}
				});
			});
		}
	}

	async list() {
		if (!this.hasList) await this.fetchList();
		else console.log("already has post list");

		const posts = Array.from(this.cache.values());

		posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

		return posts;
	}

	async fetchList() {
		if (IS_KV_REGION) {
			console.log("populating posts cache");
			for await (const record of kv.list({ prefix: ["posts"] })) {
				this.cache.set(record.value.slug, record.value);
			}
			this.hasList = true;
		} else {
			console.log("fetching posts cache from read region");
			await new Promise(resolve => {
				this.channel.postMessage({ action: "list" });
				this.channel.addEventListener("message", event => {
					const { action, payload } = event.data;
					if (action === "response-list") {
						console.log("populating posts cache");
						this.cache = payload;
						this.hasList = true;
						resolve();
					}
				});
			});
		}
	}

}
