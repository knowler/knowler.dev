import type { LoaderArgs } from "@remix-run/node";
import { auth } from "~/auth.server";
import { returnToCookie } from "~/cookies.server";

export const loader = async ({ request }: LoaderArgs) => {
  const returnTo = await returnToCookie.parse(request.headers.get("Cookie"));
  return await auth.authenticate("github", request, {
    successRedirect: returnTo ?? "/admin/dashboard",
    failureRedirect: "/",
  });
};
