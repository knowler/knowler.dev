import { createCookieSessionStorage } from "remix";
import { Authenticator } from "remix-auth";
import type { GitHubExtraParams, GitHubProfile } from "remix-auth-github";
import { GitHubStrategy } from "remix-auth-github";

console.log(process.env)

if (!process.env.GITHUB_CLIENT_ID) {
  throw new Error("GITHUB_CLIENT_ID is required");
}

if (!process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("GITHUB_CLIENT_SECRET is required");
}

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is required");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET as string],
    secure: true,
  },
});

export const auth = new Authenticator<{
  profile: GitHubProfile;
  accessToken: string;
  extraParams: GitHubExtraParams;
}>(sessionStorage);

auth.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: new URL(
        "/auth/github/callback",
        process.env.BASE_URL
      ).toString(),
    },
    async ({ profile, accessToken, extraParams }) => {
      return { profile, accessToken, extraParams };
    }
  )
);
