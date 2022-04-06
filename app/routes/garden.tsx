import { Outlet } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

export default function GardenLayout() {
  return <Outlet />;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/prism-theme-vars/base.css",
  },
];
