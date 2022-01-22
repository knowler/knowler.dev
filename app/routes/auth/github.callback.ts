import type { LoaderFunction } from "remix";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = ({ request }) =>
  authenticator.authenticate("github", request, {
    successRedirect: "/admin",
    failureRedirect: "/login",
  });
