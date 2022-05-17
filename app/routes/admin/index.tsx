import { LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const loader: LoaderFunction = async ({request}) => {
  await auth.isAuthenticated(request, {
    successRedirect: "/admin/dashboard",
  });
};
