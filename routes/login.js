export function get(c) {
	return c.render("login", {
		title: "Sign In",
		issues: [],
		formData: {},
	});
}

export async function post(c) {
	const formData = await c.req.formData();

	if (
		formData.get("username") !== Deno.env.get("SUDO_USERNAME") ||
		formData.get("password") !== Deno.env.get("SUDO_PASSWORD")
	) {
		return c.redirect(`/${Deno.env.get("LOGIN_PATH")}`, 303);
	} else {
		const session = c.get("__auth_session");
		session.set("authorized", true);
		return c.redirect("/sudo", 303);
	}
}
