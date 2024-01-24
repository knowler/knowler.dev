import kv from "~/kv.js";

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

	async get(slug) {
		if (this.cache.has(slug)) {
			console.log(`has cached page for slug: ${slug}`);
			return this.cache.get(slug);
		}

		console.log(`reading page for slug: ${slug}`);

		const slugRecord = await kv.get(["pagesBySlug", slug]);
		if (!slugRecord.value) throw `page not found with slug: ${slug}`;

		const pageRecord = await kv.get(["pages", slugRecord.value]);
		if (!pageRecord.value) throw `page not found for id: ${slugRecord.value}`;

		this.cache.set(slug, pageRecord.value);

		return pageRecord.value;
	}
}
