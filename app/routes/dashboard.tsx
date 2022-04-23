import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { GitHubProfile } from "remix-auth-github";
import { auth } from "~/auth.server";

interface LoaderData {
  profile: GitHubProfile;
};

export const loader: LoaderFunction = async ({request}) => {
  const {profile} = await auth.isAuthenticated(request, {
    failureRedirect: '/',
  });

  return json<LoaderData>({profile});
}

export default function Dashboard() {
  const {profile} = useLoaderData<LoaderData>();

  return (
    <main>
      <h1>Dashboard</h1>
      <pre>
        <code>{JSON.stringify(profile, null, 2)}</code>
      </pre>
    </main>
  );
}
