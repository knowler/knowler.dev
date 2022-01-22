import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { login, User } from "~/models/user";
import { sessionStorage } from "~/services/session.server";

export const authenticator = new Authenticator<User>(sessionStorage);

if (!GITHUB_CLIENT_ID) {
  throw new Error("Missing GITHUB_CLIENT_ID env");
}

if (!GITHUB_CLIENT_SECRET) {
  throw new Error("Missing GITHUB_CLIENT_SECRET env");
}

authenticator.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "https://knowlerkno.ws/auth/github/callback",
    },
    async (_, __, ___, profile) => login(profile.emails[0].value)
  )
);
