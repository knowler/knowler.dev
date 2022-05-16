import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { auth } from "./auth.server";

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
