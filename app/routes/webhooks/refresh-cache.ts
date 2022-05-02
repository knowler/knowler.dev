import { json, LoaderFunction } from "@remix-run/node";
import { auth } from "~/auth.server";
import { cachePages } from "~/cache.server";

export const loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request);
  return json({
    success: true,
    cachedPages: await cachePages(),
  });
};