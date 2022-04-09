import { createCookieSessionStorage } from "@remix-run/node";

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
