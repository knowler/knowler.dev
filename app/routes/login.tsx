import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const action: ActionFunction = async ({request}) => {
  return await auth.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
}

export const loader: LoaderFunction = async ({request}) => {
  return await auth.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
}
