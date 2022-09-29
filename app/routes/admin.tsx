import {
  CardStackIcon,
  DashboardIcon,
  DrawingPinIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { auth } from "~/auth.server";
import adminStyles from "~/styles/admin.css";

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
        <nav aria-label="admin" className="_nav">
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
        <form action="/logout" method="post" className="_logout">
          <button>
            <span className="visually-hidden">Logout</span>
            <ExitIcon />
          </button>
        </form>
      </header>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}
