import { getPage } from "~/models/pages.js";

export async function get(c) {
	const page = await getPage("welcome");

	return c.render("[page]", {
		title: page.title,
		page,
		canonical: c.req.url,
	});
}
