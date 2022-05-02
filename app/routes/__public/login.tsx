import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";
import { returnToCookie } from "~/cookies.server";

export const action: ActionFunction = ({ request }) => login(request);
export const loader: LoaderFunction = ({ request }) => login(request);

async function login(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") as string | null;

  try {
    return await auth.authenticate("github", request, {
      successRedirect: returnTo ?? "/admin/dashboard",
      failureRedirect: "/",
    });
  } catch (error) {
    if (!returnTo) throw error;
    if (error instanceof Response && isRedirect(error)) {
      error.headers.append(
        "Set-Cookie",
        await returnToCookie.serialize(returnTo)
      );
      return error;
    }
    throw error;
  }
}

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) return false;
  return response.headers.has("Location");
}
