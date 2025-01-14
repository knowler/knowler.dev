const REGION = Deno.env.get("DENO_REGION")
const IS_KV_REGION = Deno.env.get("KV_REGION") === REGION;

export class Pages {
	cache = new Map();
	channel = new BroadcastChannel("pages");

	constructor(kv) {
		this.kv = kv;
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
						console.log(`populating pages cache from ${event.data.from}`);
						for (const page of payload.values()) {
							this.cache.set(page.slug, page);
						}
					}
					break;
				case "purge":
					this.purgeCache();
					break;
				case "evict":
					for (const page of payload) this.evict(page);
					break;
			}
		});
	}

	purgeCache() {
		console.log("purging cache");
		this.hasList = false;
		this.cache = new Map();
	}

	evict(slug) {
		console.log(`evicting page: ${slug}`)
		this.hasList = false;
		this.cache.delete(slug);
		console.assert(!this.cache.has(slug), `evicting page ${slug} failed`);
	}

	async get(slug) {
		if (!this.cache.has(slug)) await this.fetchPage(slug);
		else console.log(`has cached page for slug: ${slug}`);

		return this.cache.get(slug);
	}

	async fetchPage(slug) {
		if (IS_KV_REGION) {
			console.log(`reading page for slug: ${slug}`);

			const slugRecord = await this.kv.get(["pagesBySlug", slug]);
			if (!slugRecord.value) throw `page not found with slug: ${slug}`;

			const pageRecord = await this.kv.get(["pages", slugRecord.value]);
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

				const slugRecord = await this.kv.get(["pagesBySlug", slug]);
				if (!slugRecord.value) throw `page not found with slug: ${slug}`;

				const pageRecord = await this.kv.get(["pages", slugRecord.value]);
				if (!pageRecord.value) throw `page not found for id: ${slugRecord.value}`;

				this.cache.set(slug, pageRecord.value);

			} finally {
				this.channel.removeEventListener("message", handleMessage);
			}
		}
	}
}
