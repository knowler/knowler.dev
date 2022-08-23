import { LiveReload, Outlet } from "@remix-run/react";
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
  return (
		<>
			<Outlet />
			<LiveReload />
    </>
  );
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width, initial-scale=1",
  title: "Nathan Knowler",
});
