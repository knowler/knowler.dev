import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";

export async function get(c) {
	try {
		const params = c.req.param();
		const page = await c.get("pages").get(params.page)

		return c.render("[page]", {
			title: page.title,
			page,
			canonical: trimTrailingSlash(c.req.url),
		});
	} catch (_) {
		return c.notFound();
	}
}
