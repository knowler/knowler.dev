import { Authenticator } from "remix-auth";
import type { GitHubExtraParams, GitHubProfile} from "remix-auth-github";
import { GitHubStrategy } from "remix-auth-github";
import invariant from "tiny-invariant";
import {sessionStorage} from '~/session.server';

const {BASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_ME} = process.env;

invariant(BASE_URL, 'BASE_URL must be set');
invariant(GITHUB_CLIENT_ID, 'GITHUB_CLIENT_ID must be set');
invariant(GITHUB_CLIENT_SECRET, 'GITHUB_CLIENT_SECRET must be set');
invariant(GITHUB_ME, 'GITHUB_ME must be set');

export const auth = new Authenticator<{
  profile: GitHubProfile;
  accessToken: string;
  extraParams: GitHubExtraParams;
}>(sessionStorage);

auth.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: new URL('/auth/github/callback', BASE_URL).toString(),
    },
    async ({profile, accessToken, extraParams}) => {
      // Must be me.
      if (profile.id !== GITHUB_ME) throw new Error('Sorry, this is not for you.');

      return {
        profile,
        accessToken,
        extraParams,
      };
    },
  )
);
