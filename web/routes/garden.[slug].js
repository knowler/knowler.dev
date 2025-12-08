export async function get(c, next) {
	try {
		const params = c.req.param();
		const kv = c.get("kv");
		const { value: id } = await kv.get(["gardenBySlug", params.slug]);
		const { value: content } = await kv.get(["garden", id]);

		return c.render("garden.[slug]", {
			content,
		});
	} catch (e) {
		console.error(e);
		await next();
	}
}
