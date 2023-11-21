export function get(c) {
	c.header("cache-control", "no-cache");
	return c.render("patterns/switch", {
		title: "Switch",
	});
}

export async function post(c) {
	console.log(Array.from(await c.req.formData()));

	return c.redirect("/patterns/switch");
}
