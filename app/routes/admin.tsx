import { useLoaderData } from "remix";
import type { LoaderFunction } from "remix";

import { authenticator } from "~/services/auth.server";
import { User } from "~/models/user";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return user;
};

export default function Admin() {
  const user = useLoaderData<User>();

  return <h1>Hello, {user.email}.</h1>;
}
