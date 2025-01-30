import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";

export async function get(c) {
	try {
		const params = c.req.param();
		const kv = c.get("kv");
		const { value: id } = await kv.get(["pagesBySlug", params.page]);
		if (!id) throw "Page not found";
		const { value: page } = await kv.get(["pages", id]);

		return c.render("[page]", {
			title: page.title,
			page,
			canonical: trimTrailingSlash(c.req.url),
		});
	} catch (_) {
		return c.notFound();
	}
}
