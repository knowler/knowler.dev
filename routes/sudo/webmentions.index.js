import kv from "~/kv.js";

export async function get(c) {
	const webmentions = await Array.fromAsync(
		kv.list({ prefix: ["webmentions"] }),
		(item) => item.value,
	);

	return c.render("sudo/webmentions.index", {
		title: "Webmentions",
		webmentions,
	});
}

export async function post(c) {
	const formData = await c.req.formData();

	switch (formData.get("_action")) {
		case "delete": {
			await kv.delete(["webmentions", formData.get("webmention")]);
		}
	}

	return c.redirect("/sudo/webmentions");
}
