const DENO_KV_DB_UUID = Deno.env.get("DENO_KV_DB_UUID");

const local = await Deno.openKv();
const production = await Deno.openKv(`https://api.deno.com/databases/${DENO_KV_DB_UUID}/connect`);

const pages = production.list({ prefix: ["pages"] });

for await (const page of pages) {
	await local.set(["pages", page.value.id], page.value);
	await local.set(["pagejBySlug", page.value.slug], page.value.id);
}

const posts = production.list({ prefix: ["posts"] });

for await (const post of posts) {
	await local.set(["posts", post.value.id], post.value);
	await local.set(["postsBySlug", post.value.slug], post.value.id);
}
