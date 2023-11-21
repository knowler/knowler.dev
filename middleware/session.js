import { CookieStore, sessionMiddleware } from "hono_sessions";
import { invariant } from "~/utils/invariant.js";

const SITE_URL = Deno.env.get("SITE_URL");
const SESSION_KEY = Deno.env.get("SESSION_KEY");

invariant(SITE_URL);
invariant(SESSION_KEY);

export const s = sessionMiddleware({
	store: new CookieStore(),
	sessionCookieName: "__session",
	expireAfterSeconds: 60 * 60 * 24 * 7,
	encryptionKey: SESSION_KEY,
	cookieOptions: {
		path: "/",
		domain: new URL(SITE_URL).hostname,
		httpOnly: true,
		secure: false,
		sameSite: "Lax",
	},
});
