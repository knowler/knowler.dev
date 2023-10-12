import kv from "~/kv.js";
import { mf2 } from "npm:microformats-parser";

/**
 * @see https://www.w3.org/TR/webmention/
 */
export async function processWebmention({ source, target }) {
	const sourceURL = new URL(source);
	const targetURL = new URL(target);

	// TODO: am I following redirects properly? And what’s a good limit? (see 3.2.2)
	const response = await fetch(sourceURL.href);

	if (!response.ok) throw "Something went wrong";

	const html = await response.text();

	if (html.indexOf(targetURL.href) === -1) throw "No mention here";

	// TODO: What all do I need to store here? It would be good to figure
	// out what the needs of the UI for displaying them are.

	const { items } = mf2(html, { baseUrl: source });

	const hEntry = items.find((item) => item.type?.includes("h-entry"));

	if (hEntry) {
		const id = crypto.randomUUID();

		// TODO: Need to determine if we need to update the existing web mention

		await kv.set(["webmention", id], { source, target, hEntry });
	}
}
