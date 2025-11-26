export async function get(c) {
	const kv = c.get("kv");
	const { value: id } = await kv.get(["pagesBySlug", "welcome"]);
	if (!id) throw "Page not found";
	const { value: page } = await kv.get(["pages", id]);

	return c.render("[page]", {
		title: page.title,
		page,
		canonical: c.req.url,
	});
}
