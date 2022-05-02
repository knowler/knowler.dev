import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { GitHubProfile } from "remix-auth-github";
import { auth } from "~/auth.server";

export const meta: MetaFunction = () => ({
  title: "Dashboard – Nathan Knowler",
});

interface LoaderData {
  name: GitHubProfile["displayName"];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { profile } = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return json<LoaderData>({
    name: profile.displayName,
  });
};

export default function Dashboard() {
  const { name } = useLoaderData<LoaderData>();

  return <h1>Welcome to the dashboard, {name}!</h1>;
}
