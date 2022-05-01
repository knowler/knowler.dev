import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const action: ActionFunction = async ({request}) => await auth.logout(request, { redirectTo: '/' });
export const loader: LoaderFunction = async ({request}) => await auth.logout(request, { redirectTo: '/' });
