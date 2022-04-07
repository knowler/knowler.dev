import { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export default function GardenLayout() {
  return <Outlet />;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300&display=swap",
  },
];
