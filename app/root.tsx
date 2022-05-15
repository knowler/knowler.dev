import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { commitSession, getSession } from "./session.server";
import { auth } from "./auth.server";
import styles from "~/root.css";

interface LoaderData {
  isAuthenticated: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const isAuthenticated = Boolean(await auth.isAuthenticated(request));

  return json<LoaderData>(
    {isAuthenticated},
    {headers: {"Set-Cookie": await commitSession(session)}},
  );
};

export default function App() {
  const { isAuthenticated } = useLoaderData<LoaderData>();
  return (
    <html
      dir="ltr"
      lang="en-ca"
      className={isAuthenticated ? "logged-in" : undefined}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width, initial-scale=1",
  title: "Nathan Knowler",
});

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
    href: styles,
  },
];
