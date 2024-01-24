import { pagesCache } from "../models/pages.js";
import { postsCache } from "../models/posts.js";

const channel = new BroadcastChannel("cache");

const handleCacheRequest = () => {
	console.log("Listening for cache requests");
	channel.addEventListener("message", event => {
		console.log("read region got mail", { action, payload });
		const { action, payload } = event.data;
		if (action === "request") {
			channel.postMessage({
				action: "response",
				payload: payload === "pages" ? pagesCache : payload === "posts" ? postsCache : [],
			});
		}
	});
}

const getCachedFromReadRegion = (model) => new Promise((resolve) => {
	channel.addEventListener("message", event => {
		const { action, payload } = event.data;
		if (action === "response") {
			console.log({ action, size: payload?.size });
			resolve(payload);
		}
	});
	channel.postMessage({ action: "request", payload: model });
});

export { handleCacheRequest, getCachedFromReadRegion };
