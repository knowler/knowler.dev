import { CookieStore } from "hono_sessions";
import { sessionMiddleware } from "./session.js";
import { invariant } from "~/utils/invariant.js";
const SITE_URL = Deno.env.get("SITE_URL");
const SESSION_KEY = Deno.env.get("SESSION_KEY");

invariant(SITE_URL);
invariant(SESSION_KEY);

export const auth = sessionMiddleware({
	store: new CookieStore(),
	sessionCookieName: "__auth_session",
	expireAfterSeconds: 60 * 60 * 24 * 7,
	encryptionKey: SESSION_KEY,
	cookieOptions: {
		path: "/",
		domain: new URL(SITE_URL).hostname,
		httpOnly: true,
		secure: true,
		sameSite: "Strict",
	},
});
