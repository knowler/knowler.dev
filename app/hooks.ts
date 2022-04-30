import { useMatches } from '@remix-run/react';

export const useAuthenticated = () =>
  useMatches()
    .find((match) => match.id === "root")
    ?.data
    ?.isAuthenticated;
