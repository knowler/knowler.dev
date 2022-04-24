import type { LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";
import { returnToCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request }) => {
  const returnTo = await returnToCookie.parse(request.headers.get("Cookie"));
  return await auth.authenticate("github", request, {
    successRedirect: returnTo ?? "/dashboard",
    failureRedirect: "/",
  });
};
