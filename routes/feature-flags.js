export function get(c) {
	const session = c.get("session");

	return c.render("feature-flags", {
		title: "Feature Flags",
		flags: new Set(session.get("flags")),
	});
}

export async function post(c) {
	const session = c.get("session");

	const formData = await c.req.formData();

	console.log(Array.from(formData));

	const flags = new Set(session.get("flags"));

	if (formData.has("blog:breadcrumbs")) flags.add("blog:breadcrumbs");
	else flags.delete("blog:breadcrumbs");

	if (flags.size === 0) session.set("flags", undefined);
	else session.set("flags", Array.from(flags));

	return c.redirect("/feature-flags", 303);
}
