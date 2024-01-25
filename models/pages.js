import kv from "~/kv.js";

const REGION = Deno.env.get("DENO_REGION")
const IS_KV_REGION = Deno.env.get("KV_REGION") === REGION;

export async function getPage(id) {
	const pageRecord = await kv.get(["pages", id]);
	if (!pageRecord.value) throw `page not found with id: ${id}`;

	return pageRecord.value;
}

export async function getPageBySlug(slug) {
	const idRecord = await kv.get(["pagesBySlug", slug]);
	if (!idRecord.value) throw `page not found with slug: ${slug}`;

	return await getPage(idRecord.value);
}

export async function getPages() {
	const iter = kv.list({ prefix: ["pages"] });
	const pages = [];

	for await (const record of iter) pages.push(record.value);

	return pages;
}

export class Pages {
	cache = new Map();
	channel = new BroadcastChannel("pages");

	constructor() {
		this.channel.addEventListener("message", async event => {
			const { action, payload } = event.data;
			switch (action) {
				case "get":
					if (!this.cache.has(payload) && IS_KV_REGION) await this.fetchPage(payload);
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
						for (const page of payload.values()) {
							this.cache.set(page.slug, post);
						}
					}
					break;
			}
		});

		queueMicrotask(() => this.channel.postMessage({ action: "connect" }));
	}

	async get(slug) {
		if (!this.cache.has(slug)) await this.fetchPage(slug);
		else console.log(`has cached page for slug: ${slug}`);

		return this.cache.get(slug);
	}

	async fetchPage(slug) {
		if (IS_KV_REGION) {
			console.log(`reading page for slug: ${slug}`);

			const slugRecord = await kv.get(["pagesBySlug", slug]);
			if (!slugRecord.value) throw `page not found with slug: ${slug}`;

			const pageRecord = await kv.get(["pages", slugRecord.value]);
			if (!pageRecord.value) throw `page not found for id: ${slugRecord.value}`;

			this.cache.set(slug, pageRecord.value);
		} else {
			let handleMessage;
			try {
				console.log("fetching cached page from read region");
				await new Promise((resolve, reject) => {
					const timeout = setTimeout(reject, 2_500);
					this.channel.postMessage({ action: "get", payload: slug });
					handleMessage = event => {
						const { action, payload, from, hasList } = event.data;
						if (action === "response-get" && payload.has(slug)) {
							clearTimeout(timeout);
							for (const page of payload.values()) {
								this.cache.set(page.slug, page);
							}
							if (hasList) this.hasList = true;
							console.log(`caching page with slug: ${slug} from ${from}`);
							resolve();
						}
					}
					this.channel.addEventListener("message", handleMessage);
				});
			} catch (_) {
				console.log(`[timed out] reading page for slug: ${slug}`);

				const slugRecord = await kv.get(["pagesBySlug", slug]);
				if (!slugRecord.value) throw `page not found with slug: ${slug}`;

				const pageRecord = await kv.get(["pages", slugRecord.value]);
				if (!pageRecord.value) throw `page not found for id: ${slugRecord.value}`;

				this.cache.set(slug, pageRecord.value);

			} finally {
				this.channel.removeEventListener("message", handleMessage);
			}
		}
	}
}
