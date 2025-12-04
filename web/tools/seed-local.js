const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");

const ENDPOINT = new URL(`${MIGRATION_PATH}/`, PRODUCTION_URL);

const kv = await Deno.openKv();

for (const { slug, id } of await get("pages")) {
	await kv.set(["pagesBySlug", slug], id);
	const page = await get(`pages/${id}`);
	await kv.set(["pages", id], page);
}

for (const { slug, id } of await get("posts")) {
	await kv.set(["postsBySlug", slug], id);
	const page = await get(`posts/${id}`);
	await kv.set(["posts", id], page);
}

await kv.set(["cache_versions"], {
	content_version: Date.now(),
	demos_verion: Date.now(),
});

async function get(path) {
	const url = new URL(path, ENDPOINT);

	return fetch(url, {
		method: "GET",
		headers: {
			authorization: `Bearer ${MIGRATION_TOKEN}`,
		},
	}).then(response => {
		if (response.ok) return response.json();
		else throw `Bad response: ${response.status} ${response.statusText}\n${response.url}`;
	});
}
