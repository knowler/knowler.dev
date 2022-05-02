import {
  CardStackIcon,
  DashboardIcon,
  DrawingPinIcon,
  EnvelopeClosedIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
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
      <header className="admin-sidebar">
        <nav aria-label="admin">
          <ul role="list" className="_nav-list">
            <li>
              <NavLink to="dashboard">
                <DashboardIcon aria-hidden />
                <span className="visually-hidden">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="pages">
                <ReaderIcon aria-hidden />
                <span className="visually-hidden">Pages</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="posts">
                <DrawingPinIcon />
                <span className="visually-hidden">Posts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="garden">
                <CardStackIcon />
                <span className="visually-hidden">Garden</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="messages">
                <EnvelopeClosedIcon />
                <span className="visually-hidden">Messages</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
      <Scripts />
    </>
  );
}
