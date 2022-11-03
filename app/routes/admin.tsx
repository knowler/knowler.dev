import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Links, Meta, NavLink, Outlet } from "@remix-run/react";
import { auth } from "~/auth.server";
import adminStyles from "~/styles/admin.css";

export const links: LinksFunction = () => [
	{rel: "stylesheet", href: adminStyles},
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
		<html lang="en-ca" dir="ltr">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<a href="#content" className="skip-link">Skip to content</a>
				<header>
					<nav aria-label="admin">
						<ul role="list">
							<li><NavLink to="dashboard">Dashboard</NavLink></li>
							<li><NavLink to="pages">Pages</NavLink></li>
							<li><NavLink to="posts">Posts</NavLink></li>
							<li><NavLink to="garden">Garden</NavLink></li>
							<li><NavLink to="messages">Messages</NavLink></li>
						</ul>
						<Form action="/logout" method="post">
							<button>Logout</button>
						</Form>
					</nav>
				</header>
				<main id="content">
					<Outlet />
				</main>
			</body>
		</html>
	);
}
