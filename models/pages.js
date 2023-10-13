import kv from "~/kv.js";

export async function getPage(slug) {
	const idRecord = await kv.get(["pagesBySlug", slug]);
	if (!idRecord.value) throw `page not found with slug: ${slug}`;

	const pageRecord = await kv.get(["pages", idRecord.value]);
	if (!pageRecord.value) throw `page not found with id: ${idRecord.value}`;

	return pageRecord.value;
}

export async function getPages() {
	const iter = kv.list({ prefix: "pages" });
	const pages = [];

	for await (const record of iter) pages.push(record.value);

	return pages;
}
