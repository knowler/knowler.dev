export async function get(c) {
	const { value: sitemap } = await c.get("kv").get(["sitemap"]);
	if (!sitemap) throw "Sitemap not found.";

	c.header("content-type", "text/xml; charset=utf-8");

	return c.body(sitemap);
}
