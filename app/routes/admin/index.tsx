import { LoaderArgs } from "@remix-run/node";
import { auth } from "~/auth.server";

export const loader = async ({request}: LoaderArgs) => auth.isAuthenticated(request, {
	successRedirect: "/admin/dashboard",
});
