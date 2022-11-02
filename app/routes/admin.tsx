import type { LoaderFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
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
			<a href="#content">Skip to content</a>
			<header className="admin-sidebar">
				<nav aria-label="admin" className="_nav">
					<ul role="list" className="_nav-list">
						<li><NavLink to="dashboard">Dashboard</NavLink></li>
						<li><NavLink to="pages">Pages</NavLink></li>
						<li><NavLink to="posts">Posts</NavLink></li>
						<li><NavLink to="garden">Garden</NavLink></li>
						<li><NavLink to="messages">Messages</NavLink></li>
					</ul>
				</nav>
				<form action="/logout" method="post" className="_logout">
					<button>
						<span className="visually-hidden">Logout</span>
					</button>
				</form>
			</header>
			<main id="content">
				<Outlet />
			</main>
		</>
	);
}
