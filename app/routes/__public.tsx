import { Links, LiveReload, Meta, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import publicStyles from "~/styles/public.css";
import { commitSession, getSession } from "~/session.server";

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
	}
];

export const loader: LoaderFunction = async ({request}) => {
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
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
				<a href="#content" className="skip-link">
					Skip to content
				</a>
				<header>
					<NavLink to="/">
						Nathan Knowler
					</NavLink>
					<nav aria-label="primary" className="_nav has-links">
						<ul role="list" className="inline-list">
							<li>
								<NavLink to="/about">About</NavLink>
							</li>
							<li>
								<NavLink to="/garden">Garden</NavLink>
							</li>
							<li>
								<NavLink to="/uses">Uses</NavLink>
							</li>
							<li>
								<a
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
									href="https://twitter.com/kn_wler"
									className="icon-link"
									title="@kn_wler on Twitter"
								>
									<span className="visually-hidden">@kn_wler on Twitter</span>
									<TwitterLogoIcon
										aria-hidden
										width={undefined}
										height={undefined}
									/>
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
					<nav aria-label="secondary">
						<ul role="list" className="inline-list">
							<li>
								<NavLink to="/accessibility">Accessibility</NavLink>
							</li>
							<li>
								<NavLink to="/privacy">Privacy</NavLink>
							</li>
							<li>
								<NavLink to="/contact">Contact</NavLink>
							</li>
						</ul>
					</nav>
				</footer>
				<details open={loaderData?.themeUpdated} className="site-preferences">
					<summary>Site Preferences</summary>
					<form name="user-preferences" method="post" action="/theme">
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
					</form>
				</details>
				<LiveReload />
			</body>
    </html>
  );
}
