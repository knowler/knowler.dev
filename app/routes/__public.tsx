import { Form, Links, LiveReload, Meta, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import publicStyles from "~/styles/public.css";
import { commitSession, getSession } from "~/session.server";
import { MastodonIcon } from "~/components/mastodon-icon";

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

export const loader: LoaderFunction = async ({ request }) => {
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

const featureDetection = `
with (document.documentElement.classList) {
	toggle("no-js", false);
	toggle("no-cookies", !navigator.cookieEnabled);
}
`;

export default function Public() {
	const loaderData = useLoaderData();

	const themes = [
		{
			value: "system",
			label: "System",
			isActive: loaderData?.theme === "system" || loaderData.theme === undefined,
		},
		{
			value: "dark",
			label: "Dark",
			isActive: loaderData?.theme === "dark",
		},
		{
			value: "light",
			label: "Light",
			isActive: loaderData?.theme === "light",
		},
	];

	return (
		<html
			dir="ltr"
			lang="en-ca"
			data-color-scheme={loaderData?.theme}
			className="no-js"
		>
			<head>
				<Meta />
				<script dangerouslySetInnerHTML={{ __html: featureDetection }} />
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
								<NavLink to="/garden">Garden</NavLink>
							</li>
							<li>
								<NavLink to="/uses">Uses</NavLink>
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
					<p className="colophon">&copy; 2015 to 2022 Nathan Knowler. All rights reserved.</p>
					<nav aria-label="secondary" className="nav">
						<ul role="list" className="nav__list inline-list">
							<li>
								<NavLink to="/accessibility">Accessibility</NavLink>
							</li>
							<li>
								<NavLink to="/privacy">Privacy</NavLink>
							</li>
							<li>
								<NavLink to="/contact">Contact</NavLink>
							</li>
							<li>
								<NavLink to="/webmention" rel="webmention">Webmention</NavLink>
							</li>
						</ul>
					</nav>
				</footer>
				<site-preferences>
					<details open={loaderData?.themeUpdated} className="site-preferences">
						<summary>Site Preferences</summary>
						<Form name="user-preferences" method="post" action="/theme">
							<fieldset aria-labelledby="theme-label">
								<span aria-hidden id="theme-label">Theme</span>
								{themes.map(theme => (
									<button
										key={theme.value}
										name="theme"
										value={theme.value}
										id={`${theme.value}-theme`}
										aria-labelledby={`${theme.value}-theme theme-label`}
										aria-pressed={theme.isActive}
										autoFocus={loaderData?.themeUpdated && theme.isActive}
									>
										{theme.label}
									</button>
								))}
							</fieldset>
						</Form>
					</details>
				</site-preferences>
				<LiveReload />
			</body>
		</html>
	);
}
