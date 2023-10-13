export async function migrate() {
	const kv = await Deno.openKv();

	const iter = kv.list({ prefix: ["posts"] });

	for await (const record of iter) {
		const post = record.value;

		post.html = await Deno.readTextFile(`./routes/_blog/${post.slug}.html`);

		await kv.set(["posts", post.id], post);
	}
}
