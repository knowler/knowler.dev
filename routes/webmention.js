import kv from "~/kv.js";

// TODO: implement UI for webmentions
export function get(c) {
	const session = c.get("session");
	const url = new URL(c.req.url);
	const issues = session.get("issues") ?? [];
	const formData = session.get("formData") ?? { target: url.searchParams.get("target") ?? undefined };
	const success = session.get("success");

	if (issues.length > 0) c.status(422);
	else if (success) c.status(202);
	else c.status(200);

	return c.render(
		"webmention",
		{
			title: "Webmention",
			success,
			issues,
			formData,
		},
	);
}

export async function post(c) {
	const session = c.get("session");
	// This is a very naïve check to see if the referrer was the
	// webmention form on this website.
	// TODO: update this to support webmention forms on individual blog
	// post pages (i.e. only check the domain)
	const isFormRequest = c.req.url === c.req.headers.get("referer");

	const formData = await c.req.formData();

	if (isFormRequest && formData.get("robotName") !== "") {
		// Bad actor
		throw "Evil…";
	}

	const { source, target } = Object.fromEntries(formData);

	const issues = [];

	// Also should validate:
	// - Each URL are parseable URLs.
	// - The Target URL is a real URL for my website.

	if (!source) issues.push({ field: "source", message: "Source URL is missing." });
	if (!URL.canParse(source)) issues.push({ field: "source", message: "Source URL is not a valid URL." });
	if (!target) issues.push({ field: "target", message: "Target URL is missing." });
	if (!URL.canParse(target)) issues.push({ field: "target", message: "Source URL is not a valid URL." });
	const SITE_URL = Deno.env.get("SITE_URL");
	if (target && new URL(target).origin !== SITE_URL) issues.push({ field: "target", message: `Target URL must be for this website (i.e. ${SITE_URL}).` })
	if (source && target && source === target) issues.push({ form: true, message: "Source and target URLs cannot be the same." });

	if (issues.length > 0) {
		session.flash("issues", issues);
		session.flash("formData", Object.fromEntries(formData));

		return c.redirect("/webmention", isFormRequest ? 303 : 422);
	}

	// Success
	kv.enqueue({
		action: "process-webmention",
		payload: {
			target,
			source,
		},
	});

	session.flash("success", true);

	return c.redirect("/webmention", isFormRequest ? 303 : 202);
}
