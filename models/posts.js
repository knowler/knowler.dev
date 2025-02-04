export class Posts {
	baseURL = new URL("http://posts.localhost");

	constructor(kv) {
		this.kv = kv;
	}

	get cache() {
		const cache = caches.open(`posts.${Deno.env.get("CONTENT_VERSION")}`);

		return {
			async match(url) {
				return (await cache).match(url);
			},
			async put(url, response) {
				return (await cache).put(url, response);
			},
		}
	}

	slugURL(slug) {
		return new URL(`/slug/${slug}`, this.baseURL);
	}

	idURL(id) {
		return new URL(`/id/${id}`, this.baseURL);
	}

	async getBySlug(slug) {
		const url = this.slugURL(slug);
		let response = await this.cache.match(url);
		if (response) {
			console.log(`HIT posts object cache for slug: ${slug}`);
			return response.json();
		}
		console.log(`MISS posts object cache for slug: ${slug}`);

		const { value: id } = await this.kv.get(["postsBySlug", slug]);
		if (!id) throw `Post not found with slug: ${slug}`;
		const post = await this.getById(id);
		response = Response.json(post);
		await this.cache.put(url, response);

		return post;
	}

	async getById(id) {
		const url = this.idURL(id);
		let response = await this.cache.match(url);
		if (response) {
			console.log(`HIT posts object cache for id: ${id}`);
			return response.json();
		}
		console.log(`MISS posts object cache for id: ${id}`);

		const { value: post } = await this.kv.get(["posts", id]);
		if (!post) throw `Post not found with id: ${id}`;
		response = Response.json(post);
		// Check if the slug version has been cached? If not, cache a clone.
		const slugURL = this.slugURL(post.slug);
		if (!this.cache.match(slugURL)) {
			await this.cache.put(slugURL, response.clone());
		}
		await this.cache.put(url, response);

		return post;
	}

	async store(post) {
		const matched = await this.cache.match(new URL(`/id/${post.id}`, this.baseURL));
		if (matched) return;

		return Promise.all([
			this.cache.put(this.slugURL(post.slug), Response.json(post)),
			this.cache.put(this.idURL(post.id), Response.json(post)),
		]);
	}
}
