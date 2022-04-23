import type { LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const loader: LoaderFunction = async ({request}) => {
  return await auth.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
}
