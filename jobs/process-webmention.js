import kv from "~/kv.js";
import { mf2 } from "npm:microformats-parser";
import { getPostBySlug } from "~/models/posts.js";

// TODO: differentiate error types
async function postForTarget(url) {
	const postPattern = new URLPattern({ pathname: "/blog/:slug{/}?" });
	const slug = postPattern.exec({ pathname: url.pathname })?.pathname?.groups
		?.slug;

	if (!slug) throw `Not a post`;

	const post = await getPostBySlug(slug, { withWebmentions: true });

	if (!post) throw `No post found`;

	return post;
}

/**
 * @see https://www.w3.org/TR/webmention/
 */
export async function processWebmention({ source, target }) {
	const sourceURL = new URL(source);
	const targetURL = new URL(target);

	try {
		const post = await postForTarget(targetURL);
		const existingWebmention = post.webmentions.find((webmention) =>
			webmention.source === source
		);
		const id = existingWebmention?.id ?? crypto.randomUUID();

		// TODO: Ensure redirects are handled properly (see 3.2.2).
		const response = await fetch(sourceURL.href);

		if (!response.ok) throw "Could not fetch source";

		const html = await response.text();

		// The target URL must be in the source page for it to be a valid
		// Webmention
		if (html.indexOf(targetURL.href) === -1) {
			throw "Target URL not found in source document";
		}

		const { items } = mf2(html, { baseUrl: source });
		const hEntry = items.find((item) => item.type?.includes("h-entry"));

		// TODO: store a bit more information here (e.g. author name, a URL
		// to an avatar, etc.).
		// TODO: determine the type

		// Persist Webmention (or updated data)
		await kv.set(["webmentions", id], {
			id,
			source,
			target,
			hEntry,
		});
		console.log(`Stored webmention ${id}`, { source, target });

		// Setup relationship with post
		if (!existingWebmention) {
			post.webmentions = post.webmentions.map((webmention) => webmention.id);
			post.webmentions.push(id);
			await kv.set(["posts", post.id], post);
			console.log(`Associated webmention with post: ${post.slug} (${post.id})`);
		}
	} catch (error) {
		// TODO: differentiate errors and throw for real errors (which will
		// allow the queued job to retry).
		console.error(error, { source, target });
	}
}
