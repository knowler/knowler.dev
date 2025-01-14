import { URLSearchParams } from "https://deno.land/std@0.177.1/node/url.ts";
import { ulidFromISOString } from "~/utils/util-from-iso-string.js";

const postsBySlug = new Map(JSON.parse(await Deno.readTextFile("./data/postsBySlug.json")).postsBySlug);

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

export class Posts {
	hasList = false;
	cache = new Map();

	purgeCache() {
		console.log("purging cache");
		this.cache = new Map();
		this.hasList = false;
	}

	evict(slug) {
		console.log(`evicting post: ${slug}`)
		this.cache.delete(slug);
		this.hasList = false;
		console.assert(!this.cache.has(slug), `evicting page ${slug} failed`);
	}

	async get(slug) {
		if (!this.cache.has(slug)) await this.fetchPost(slug);
		else console.log(`has cached post for slug: ${slug}`);

		return this.cache.get(slug);
	}

	async fetchPost(slug) {
		const id = postsBySlug.get(slug);
		const post = JSON.parse(await Deno.readTextFile(`./data/posts/${id}.json`));
		this.cache.set(slug, post);
	}

	async list() {
		if (!this.hasList) await this.fetchList();
		else console.log("already has post list");

		const posts = Array.from(this.cache.values());

		posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

		return posts;
	}

	async fetchList() {
		for (const [slug, id] of postsBySlug) {
			if (!this.cache.has(slug)) {
				this.cache.set(slug, JSON.parse(await Deno.readTextFile(`./data/posts/${id}.json`)));
			}
		}
		this.hasList = true;
	}

}
