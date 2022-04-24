import { createCookie } from "@remix-run/node";

export const returnToCookie = createCookie("return-to", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60,
  secure: process.env.NODE_ENV === "production",
});
