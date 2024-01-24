import kv from "~/kv.js";
import { getCachedFromReadRegion } from "~/utils/get-cached-from-read-region.js";

const DENO_REGION = Deno.env.get("DENO_REGION");
const KV_REGION = Deno.env.get("KV_REGION");
const IS_KV_REGION = DENO_REGION === KV_REGION;

export const pagesCache = new Map(
	IS_KV_REGION
		? await Array.fromAsync(
			kv.list({ prefix: ["pages"] }, { consistency: IS_KV_REGION ? "strong" : "eventual" }),
			record => [record.value.slug, record.value],
		)
		: await getCachedFromReadRegion("pages")
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

	kv.enqueue({ action: "populate-cache" });

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
