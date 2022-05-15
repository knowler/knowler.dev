import type { ActionFunction } from "@remix-run/node";
import { auth } from "~/auth.server";

export const action: ActionFunction = async ({request}) => await auth.logout(request, { redirectTo: '/' });
