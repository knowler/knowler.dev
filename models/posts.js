import { URLSearchParams } from "https://deno.land/std@0.177.1/node/url.ts";
import kv from "~/kv.js";
import { ulidFromISOString } from "~/utils/util-from-iso-string.js";

const REGION = Deno.env.get("DENO_REGION");
const IS_KV_REGION = Deno.env.get("KV_REGION") === REGION;

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
	pagesCache = new Map();
	channel = new BroadcastChannel("posts");

	constructor() {
		this.channel.addEventListener("message", async event => {
			const { action, payload } = event.data;
			switch (action) {
				case "list":
					if (!this.hasList && IS_KV_REGION) await this.fetchList();
					if (this.hasList) this.channel.postMessage({ action: "response-list", payload: this.cache, from: REGION});
					break;
				case "get":
					if (!this.cache.has(payload) && IS_KV_REGION) await this.fetchPost(payload);
					if (this.cache.has(payload)) {
						this.channel.postMessage({
							action: "response-get",
							payload: this.cache,
							from: REGION,
							hasList: this.hasList,
						});
					}
				break;
				case "connect":
					this.channel.postMessage({
						action: "populate",
						payload: this.cache,
						from: REGION,
						hasList: this.hasList,
					});
					break;
				case "populate":
					if (!this.hasList) {
						if (event.data.hasList) this.hasList = true;
						console.log(`populating posts cache from ${event.data.from}`);
						for (const post of payload.values()) {
							this.cache.set(post.slug, post);
						}
					}
					break;
				case "purge":
					this.purgeCache();
					break;
				case "evict":
					for (const post of payload) this.evict(post);
					break;
			}
		});
	}

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
		if (IS_KV_REGION) {
			console.log(`reading post for slug: ${slug}`);
			const slugRecord = await kv.get(["postsBySlug", slug]);
			if (!slugRecord.value) throw `post not found with slug: ${slug}`;

			const postRecord = await kv.get(["posts", slugRecord.value]);
			if (!postRecord.value) throw `post not found for id: ${slugRecord.value}`;

			this.cache.set(slug, postRecord.value);
		} else {
			let handleMessage;
			try {
				console.log(`fetching cached post ${slug} from other isolates`);
				await new Promise((resolve, reject) => {
					const timeout = setTimeout(reject, 2_500);
					this.channel.postMessage({ action: "get", payload: slug });
					handleMessage = event => {
						const { action, payload, from, hasList } = event.data;
						if (action === "response-get" && payload.has(slug)) {
							clearTimeout(timeout);
							console.log(`caching post with slug: ${slug} from ${from}`);
							for (const post of payload.values()) {
								this.cache.set(post.slug, post);
							}
							if (hasList) this.hasList = true;
							resolve();
						}
					}
					this.channel.addEventListener("message", handleMessage);
				});
			} catch (_) {
				console.log(`[timed out] reading post for slug: ${slug}`);
				const slugRecord = await kv.get(["postsBySlug", slug]);
				if (!slugRecord.value) throw `post not found with slug: ${slug}`;

				const postRecord = await kv.get(["posts", slugRecord.value]);
				if (!postRecord.value) throw `post not found for id: ${slugRecord.value}`;

				this.cache.set(slug, postRecord.value);
			} finally {
				this.channel.removeEventListener("message", handleMessage);
			}
		}
	}

	// TODO: figure out how to cache this
	async page(options) {
		const pageKey = new URLSearchParams(!options ? "mostRecent" : options.oldest ? "oldest" : "");

		const selector = { prefix: ["posts"] };
		// We have to fetch one extra to know if there’s a “next”
		const listOptions = { reverse: true, limit: 11 };

		// Next page (older)
		if (options?.before) {
			pageKey.set("before", options.before);
			selector.end = ["posts", ulidFromISOString(options.before, -1)];
		}

		// Previous page (more recent)
		if (options?.after) {
			pageKey.set("after", options.after);
			selector.start = ["posts", ulidFromISOString(options.after, 1)];
		}

		if (options?.oldest || (!options?.before && options?.after)) listOptions.reverse = false;

		if (this.pagesCache.has(pageKey.toString())) {
			console.log(`has cached for ${pageKey}`)
			return this.pagesCache.get(pageKey.toString());
		}

		const posts = [];
		const entries = kv.list(selector, listOptions);
		let hasNext = false;

		for await (const entry of entries) {
			if (posts.length === listOptions.limit - 1) {
				hasNext = true;
				break;
			}
			const post = entry.value;
			posts.push(post);
			this.cache.set(posts.slug, post);
		}

		const page = {
			hasNext,
			posts: listOptions.reverse ? posts : posts.reverse(),
		};

		this.pagesCache.set(pageKey.toString(), page);

		return page;
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
			let handleMessage;
			try {
				await new Promise((resolve, reject) => {
					const timeout = setTimeout(reject, 2_500);
					this.channel.postMessage({ action: "list" });
					handleMessage = event => {
						const { action, payload, from } = event.data;
						if (action === "response-list") {
							clearTimeout(timeout);
							console.log(`populating posts cache from ${from}`);
							this.cache = payload;
							this.hasList = true;
							resolve();
						}
					};
					this.channel.addEventListener("message", handleMessage);
				});
			} catch(_) {
				console.log("[timed out] populating posts cache");
				for await (const record of kv.list({ prefix: ["posts"] })) {
					this.cache.set(record.value.slug, record.value);
				}
				this.hasList = true;
			} finally {
				this.channel.removeEventListener("message", handleMessage);
			}
		}
	}

}
