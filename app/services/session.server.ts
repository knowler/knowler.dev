import { createCookieSessionStorage, Session } from "remix";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret1"],
    secure: true,
  },
});

export function getSession(request: Request): Promise<Session> {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export const { commitSession, destroySession } = sessionStorage;
