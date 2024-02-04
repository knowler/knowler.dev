import kv from "~/kv.js";

const REGION = Deno.env.get("DENO_REGION")
const IS_KV_REGION = Deno.env.get("KV_REGION") === REGION;

export class Demos {
	cache = new Map();
	channel = new BroadcastChannel("demos");

	constructor() {
		this.channel.addEventListener("message", async event => {
			const { action, payload } = event.data;
			switch (action) {
				case "get":
					if (!this.cache.has(payload) && IS_KV_REGION) await this.fetchDemo(payload);
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
						console.log(`populating demos cache from ${event.data.from}`);
						for (const [demoId, demo] of payload) {
							this.cache.set(demoId, demo);
						}
					}
					break;
				case "purge":
					this.purgeCache();
					break;
				case "evict":
					for (const demoId of payload.keys()) this.evict(demoId);
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
		console.log(`evicting demo: ${slug}`)
		this.hasList = false;
		this.cache.delete(slug);
		console.assert(!this.cache.has(slug), `evicting demo ${slug} failed`);
	}

	async get(slug) {
		if (!this.cache.has(slug)) await this.fetchDemo(slug);
		else console.log(`has cached demo for slug: ${slug}`);

		return this.cache.get(slug);
	}

	async fetchDemo(slug) {
		if (IS_KV_REGION) {
			console.log(`reading demo for slug: ${slug}`);

			const demoRecord = await kv.get(["demos", slug]);
			if (!demoRecord.value) throw `demo not found with slug: ${slug}`;

			this.cache.set(slug, demoRecord.value);
		} else {
			let handleMessage;
			try {
				console.log("fetching cached demo from read region");
				await new Promise((resolve, reject) => {
					const timeout = setTimeout(reject, 2_500);
					this.channel.postMessage({ action: "get", payload: slug });
					handleMessage = event => {
						const { action, payload, from, hasList } = event.data;
						if (action === "response-get" && payload.has(slug)) {
							clearTimeout(timeout);
							for (const [demoId, demo] of payload) {
								this.cache.set(demoId, demo);
							}
							if (hasList) this.hasList = true;
							console.log(`caching demo with slug: ${slug} from ${from}`);
							resolve();
						}
					}
					this.channel.addEventListener("message", handleMessage);
				});
			} catch (_) {
				console.log(`[timed out] reading demo for slug: ${slug}`);

				const demoRecord = await kv.get(["demos", slug]);
				if (!demoRecord.value) throw `demo not found with slug: ${slug}`;

				this.cache.set(slug, demoRecord.value);

			} finally {
				this.channel.removeEventListener("message", handleMessage);
			}
		}
	}
}
