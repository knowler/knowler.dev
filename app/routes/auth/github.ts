import { ActionFunction, redirect } from "remix";
import type { LoaderFunction } from "remix";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = () => redirect("/login");

export const action: ActionFunction = async ({ request }) => {
  return await authenticator.authenticate("github", request);
};
