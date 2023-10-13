import { getPageBySlug } from "~/models/pages.js";

export async function get(c) {
	const page = await getPageBySlug("welcome");

	return c.render("[page]", {
		title: page.title,
		page,
		canonical: c.req.url,
	});
}
