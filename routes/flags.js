import { setSignedCookie } from "https://deno.land/x/hono@v3.12.8/middleware.ts";
import { sign } from "https://deno.land/x/hono@v3.12.8/utils/jwt/jwt.ts";

const SESSION_KEY = Deno.env.get("SESSION_KEY");
const SITE_URL = Deno.env.get("SITE_URL");

export function get(c) {
	const session = c.get("__flags_session");

	return c.render("flags", {
		title: "Feature Flags",
		success: session.get("success"),
	});
}

export async function post(c) {
	const session = c.get("__flags_session");

	const flags = c.get("flags");
	const formData = await c.req.formData();

	// Bad actor
	if (formData.get("robotName") !== "") return c.redirect("/flags", 303);

	if (formData.has("blog:breadcrumbs")) flags.add("blog:breadcrumbs");
	else flags.delete("blog:breadcrumbs");

	const token = await sign(Array.from(flags), SESSION_KEY);

	await setSignedCookie(c, "flags", token, SESSION_KEY, {
		path: "/",
		secure: true,
		domain: new URL(SITE_URL).hostname,
		httpOnly: true,
		maxAge: 365 * 24 * 60 * 60,
		sameSite: "Strict",
	});

	session.flash("success", true);

	return c.redirect("/flags", 303);
}
