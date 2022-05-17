import { LoaderFunction, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { auth } from "~/auth.server";

export const loader: LoaderFunction = async ({request}) => {
  const {pathname} = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });
  return json({});
};

export default function Pages() {
  return <Outlet />;
}
