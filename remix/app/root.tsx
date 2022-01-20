import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";

import styles from "~/styles/main.css";

export const meta: MetaFunction = () => {
  return { title: "Nathan Knowler" };
};

export default function App() {
  return (
    <html lang="en-ca">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#content">Skip to content</a>
        <header>
          <nav aria-label="primary">
            <NavLink to="/" className="site-title">
              Nathan Knowler
            </NavLink>
            <ul>
              <li>
                <NavLink to="/garden">Garden</NavLink>
              </li>
              <li>
                <NavLink to="/patterns">Patterns</NavLink>
              </li>
              <li>
                <NavLink to="/uses">Uses</NavLink>
              </li>
              <li>
                <NavLink to="/reading">Reading</NavLink>
              </li>
              <li>
                <NavLink to="/cv">CV</NavLink>
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
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
}
