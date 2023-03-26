import { Links, LiveReload, Meta, NavLink, Outlet } from "@remix-run/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { json, LinksFunction, LoaderArgs } from "@remix-run/node";
import { commitSession, getSession } from "~/session.server";
import { MastodonIcon } from "~/components/mastodon-icon";
import publicStyles from "./public.css";

export const links: LinksFunction = () => [
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com",
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Poppins:wght@300;500&display=swap",
	},
	{
		rel: "stylesheet",
		href: publicStyles,
	},
	{
		rel: "alternate",
		type: "application/rss+xml",
		title: "RSS",
		href: "/feed.xml"
	},
];

export async function loader({ request }: LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));

	return json({
		theme: session.get("theme"),
		themeUpdated: session.get("themeUpdated"),
	}, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

export default function Public() {
	return (
		<html lang="en-ca">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<a href="#content" className="skip-link">
					Skip to content
				</a>
				<header className="site-head">
					<NavLink to="/">
						Nathan Knowler
					</NavLink>
					<nav aria-label="primary" className="nav">
						<ul role="list" className="nav__list inline-list">
							<li>
								<NavLink to="/about">About</NavLink>
							</li>
							<li>
								<NavLink to="/blog">Blog</NavLink>
							</li>
							<li>
								<a
									rel="me"
									href="https://github.com/knowler"
									className="icon-link"
									title="@knowler on GitHub"
								>
									<span className="visually-hidden">@knowler on GitHub</span>
									<GitHubLogoIcon
										aria-hidden
										width={undefined}
										height={undefined}
									/>
								</a>
							</li>
							<li>
								<a
									rel="me"
									href="https://sunny.garden/@knowler"
									className="icon-link"
									title="@knowler@sunny.garden on Mastodon"
								>
									<span className="visually-hidden">@knowler@sunny.garden on Mastodon</span>
									<MastodonIcon aria-hidden />
								</a>
							</li>
						</ul>
					</nav>
				</header>
				<main id="content">
					<Outlet />
				</main>
				<footer>
					<p className="colophon">&copy; {new Intl.DateTimeFormat("en-ca", {timeZone: "America/Winnipeg", year: "numeric"}).format(new Date())} Nathan Knowler. All rights reserved.</p>
					<nav aria-label="secondary" className="nav">
						<ul role="list" className="nav__list inline-list">
							<li>
								<NavLink to="/accessibility">Accessibility</NavLink>
							</li>
							<li>
								<NavLink to="/privacy">Privacy</NavLink>
							</li>
						</ul>
					</nav>
				</footer>
				<LiveReload />
			</body>
		</html>
	);
}
