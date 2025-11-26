export function get(c) {
	c.status(404);

	return c.render("404", {
		title: "Not Found",
	});
}
