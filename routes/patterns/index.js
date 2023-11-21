export function get(c) {
	c.header("cache-control", "no-cache");

	return c.render("patterns/index", {
		title: "Progressive Enhancement Patterns",
	});
}
