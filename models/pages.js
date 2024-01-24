import kv from "~/kv.js";

export const pagesCache = new Map(
	await Array.fromAsync(
		kv.list({ prefix: ["pages"] }),
		record => [record.value.slug, record.value],
	)
);

export async function getPage(id) {
	const pageRecord = await kv.get(["pages", id]);
	if (!pageRecord.value) throw `page not found with id: ${id}`;

	return pageRecord.value;
}

export async function getPageBySlug(slug) {
	if (pagesCache.has(slug)) {
		console.log("Has cached page");
		return pagesCache.get(slug);
	}

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
