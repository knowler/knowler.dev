export function getShadowRoots(root = document) {
	const shadowRoots = new Set();

	const iterator = document.createNodeIterator(
		root,
		NodeFilter.SHOW_ELEMENT,
		node => node.shadowRoot ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
	);

	let currentNode;
	while (currentNode = iterator.nextNode()) shadowRoots.add(currentNode);

	for (const shadowRoot of shadowRoots) {
		for (const nestedShadowRoot of getShadowRoots(shadowRoot)) {
			shadowRoots.add(nestedShadowRoot);
		}
	}

	return shadowRoots;
}
