import { LoaderFunction, json, LinksFunction } from "@remix-run/node";
import { NavLink, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { auth } from "~/auth.server";
import adminStyles from "./admin.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: adminStyles },
];

export const loader: LoaderFunction = async ({ request }) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

  return json({});
};

export default function Auth() {
  return (
    <>
      <aside>
        <nav aria-label="admin">
          <ul>
            <li>
              <NavLink to="dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="pages">Pages</NavLink>
            </li>
            <li>
              <NavLink to="posts">Posts</NavLink>
            </li>
            <li>
              <NavLink to="garden">Garden</NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
      <Scripts />
    </>
  );
}
