export function getCachedFromReadRegion(model) {
	const channel = new BroadcastChannel("cache");

	channel.postMessage({ action: "request", payload: model });

	return new Promise((resolve, reject) => {
		const timeout = setTimeout(reject, 5_000);
		channel.addEventListener("message", event => {
			const { action, payload } = event.data;
			switch (action) {
				case "response": {
					clearTimeout(timeout); // Is it necessary to clear a timeout if we resolve first?
					resolve(payload);
					break;
				}
			}
		});
	});
}
