export function getCachedFromReadRegion(model) {
	const channel = new BroadcastChannel("cache");

	return new Promise((resolve) => {
		channel.addEventListener("message", event => {
			const { action, payload } = event.data;
			if (action === "response") resolve(payload);
		});
		channel.postMessage({ action: "request", payload: model });
	});
}
