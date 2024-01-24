export async function get(c) {
	const page = await c.get("pages").get("welcome");

	return c.render("[page]", {
		title: page.title,
		page,
		canonical: c.req.url,
	});
}
