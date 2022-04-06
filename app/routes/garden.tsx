import { Outlet } from "remix";
import type { LinksFunction } from "remix";

export default function GardenLayout() {
  return <Outlet />;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/prism-theme-vars/base.css",
  },
];
