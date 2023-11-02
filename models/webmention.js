import kv from "~/kv.js";

export async function getWebmention(id) {
	const record = await kv.get(["webmentions", id]);
	if (!record) throw `webmention not found with id: ${id}`;

	return record.value;
}
