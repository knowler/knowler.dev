import {
  CardStackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  DrawingPinIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { useState } from "react";
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
	const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <html
			dir="ltr"
			lang="en-ca"
		>
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<header>
					<nav aria-label="admin">
						<button type="button" onClick={() => setSidebarExpanded(expanded => !expanded)} aria-pressed={sidebarExpanded}>
							{sidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
							<span className="visually-hidden">{sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}</span>
						</button>
						<ul role="list">
							<li>
								<NavLink to="dashboard">
									<DashboardIcon aria-hidden />
									<span className="label">Dashboard</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="pages">
									<ReaderIcon aria-hidden />
									<span className="label">Pages</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="posts">
									<DrawingPinIcon />
									<span className="label">Posts</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="garden">
									<CardStackIcon />
									<span className="label">Garden</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="messages">
									<EnvelopeClosedIcon />
									<span className="label">Messages</span>
								</NavLink>
							</li>
						</ul>
					</nav>
					<form name="logout" action="/logout" method="post">
						<button>
							<ExitIcon />
							<span className="label">Logout</span>
						</button>
					</form>
				</header>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
  );
}
