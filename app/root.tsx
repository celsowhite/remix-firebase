import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import "./tailwind.css";
import { adminAuth } from "~/lib/firebase.server";
import { getUserId } from "~/lib/session.server";
import { PROTECTED_ROUTES, LOGIN_ROUTE } from "./constants/routes";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  // If the user is trying to access a protected route and they are not logged in, redirect to login
  if (!userId && PROTECTED_ROUTES.includes(pathname)) {
    const searchParams = new URLSearchParams([["redirectTo", pathname]]);
    return redirect(`${LOGIN_ROUTE}?${searchParams}`);
  }

  if (!userId) {
    return json({ user: null });
  }

  // If the user is logged in, fetch their user data
  try {
    const user = await adminAuth.getUser(userId);
    return json({ user: user.toJSON() });
  } catch (error) {
    console.error("Error fetching user:", error);
    return redirect(LOGIN_ROUTE);
  }
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
