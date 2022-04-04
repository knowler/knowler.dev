import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction, LinksFunction } from "remix";

export default function App() {
  return (
    <html dir="ltr" lang="en-ca">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#content">Skip to content</a>
        <header>
          <NavLink to="/" className="site-title">
            Nathan Knowler
          </NavLink>
          <nav aria-label="primary">
            <ul>
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
        <div id="content"></div>
        <main>
          <Outlet />
        </main>
        <footer>
          <p>&copy; 2015 to 2022 Nathan Knowler. All rights reserved.</p>
          <nav aria-label="secondary">
            <ul>
              <li>
                <NavLink to="/accessibility">Accessibility</NavLink>
              </li>
              <li>
                <NavLink to="/privacy">Privacy</NavLink>
              </li>
            </ul>
          </nav>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const meta: MetaFunction = () => ({ title: "Nathan Knowler" });

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
    href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Poppins:wght@300;500&family=JetBrains+Mono:wght@300&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/prism-theme-vars/base.css",
  },
  {
    rel: "stylesheet",
    href: "/main.css",
  },
];
