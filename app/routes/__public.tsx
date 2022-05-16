import { NavLink, Outlet } from "@remix-run/react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { LinksFunction } from "@remix-run/node";
import publicStyles from "./public.css";

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
  { rel: "stylesheet", href: publicStyles },
];

export default function Public() {
  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className="banner">
        <NavLink to="/" className="_title">
          Nathan Knowler
        </NavLink>
        <nav aria-label="primary" className="_nav has-links">
          <ul role="list" className="_nav-list">
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
              <a
                href="https://github.com/knowler"
                className="_github-link"
                title="@knowler on GitHub"
              >
                <span className="visually-hidden">@knowler on GitHub</span>
                <GitHubLogoIcon
                  aria-hidden
                  className="_github-icon"
                  width={undefined}
                  height={undefined}
                />
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="content" className="has-links">
        <Outlet />
      </main>
      <footer className="content-info has-links">
        <p>&copy; 2015 to 2022 Nathan Knowler. All rights reserved.</p>
        <nav aria-label="secondary">
          <ul role="list" className="_nav-list">
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
    </>
  );
}
