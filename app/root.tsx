import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { MetaFunction, LinksFunction, LoaderFunction } from "@remix-run/node";
import styles from "~/root.css";
import { commitSession, getSession } from "./session.server";
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils";

interface LoaderData {
  csrf: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  return json<LoaderData>(
    {
      csrf: createAuthenticityToken(session),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export default function App() {
  const { csrf } = useLoaderData<LoaderData>();

  return (
    <AuthenticityTokenProvider token={csrf}>
      <html dir="ltr" lang="en-ca">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <a href="#content" className="skip-link">
            Skip to content
          </a>
          <header>
            <NavLink to="/" className="site-title">
              Nathan Knowler
            </NavLink>
            <nav aria-label="primary">
              <ul role="list">
                <li>
                  <NavLink to="/about">About</NavLink>
                </li>
                <li>
                  <NavLink to="/garden">Garden</NavLink>
                </li>
                <li>
                  <NavLink to="/uses">Uses</NavLink>
                </li>
                <li>
                  <a href="https://github.com/knowler">
                    GitHub{" "}
                    <span className="github-link-icon" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              </ul>
            </nav>
          </header>
          <main id="content">
            <Outlet />
          </main>
          <footer>
            <p>&copy; 2015 to 2022 Nathan Knowler. All rights reserved.</p>
            <nav aria-label="secondary">
              <ul role="list">
                <li>
                  <NavLink to="/accessibility">Accessibility</NavLink>
                </li>
                <li>
                  <NavLink to="/privacy">Privacy</NavLink>
                </li>
                <li>
                  <NavLink to="/contact">Contact</NavLink>
                </li>
              </ul>
            </nav>
          </footer>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </AuthenticityTokenProvider>
  );
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width, initial-scale=1",
  title: "Nathan Knowler",
});

export const links: LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Poppins:wght@300;500&display=swap",
  },
  {
    rel: "stylesheet",
    href: styles,
  },
];
