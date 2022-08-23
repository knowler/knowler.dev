import { ActionFunction, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";

export const action: ActionFunction = async ({request}) => {
	const formData = await request.formData();
	const session = await getSession(request.headers.get("Cookie"));
	const referer = request.headers.get("referer");
	if (!referer) throw "no referer!";

	session.set("theme", formData.get("theme"));

	session.flash("themeUpdated", true);

	return redirect(referer, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};
