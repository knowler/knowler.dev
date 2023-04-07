import { Outlet } from "@remix-run/react";
import { json, LinksFunction } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { auth } from "./auth.server";
import { getSeo } from "./seo";

const [seoMeta, seoLinks] = getSeo({
	twitter: {
		site: "@kn_wler",
		creator: "@kn_wler",
		card: "summary",
	},
});

interface LoaderData {
  isAuthenticated: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const isAuthenticated = Boolean(await auth.isAuthenticated(request));

  return json<LoaderData>(
    {isAuthenticated},
  );
};

export default function App() {
  return <Outlet />;
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width, initial-scale=1",
	'color-scheme': 'dark light',
	//webmention: `${new URL('webmention', process.env.BASE_URL)}`,
	...seoMeta,
});

export const links: LinksFunction = () => [
	{rel: 'author', href: '/', title: 'About the author'},
	...seoLinks,
];
