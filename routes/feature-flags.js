export function get(c) {
	const session = c.get("__flags_session");

	return c.render("feature-flags", {
		title: "Feature Flags",
		flags: new Set(session.get("flags")),
		success: session.get("success"),
	});
}

export async function post(c) {
	const session = c.get("__flags_session");

	const formData = await c.req.formData();

	// Bad actor
	if (formData.get("robotName") !== "") return c.redirect("feature-flags", 303);

	const flags = new Set(session.get("flags"));

	if (formData.has("blog:breadcrumbs")) flags.add("blog:breadcrumbs");
	else flags.delete("blog:breadcrumbs");

	if (flags.size === 0) session.set("flags", undefined);
	else session.set("flags", Array.from(flags));

	session.flash("success", true);

	return c.redirect("/feature-flags", 303);
}
