import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_DOMAIN, 'SESSION_DOMAIN must be set');
invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      domain: process.env.SESSION_DOMAIN as string,
      expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET as string],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
