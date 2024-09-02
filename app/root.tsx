import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import "./tailwind.css";
import { getUser } from "~/lib/session.server";
import { PROTECTED_ROUTES, LOGIN_ROUTE } from "./constants/routes";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  // If the user is trying to access a protected route and they are not logged in, redirect to login
  if (!user && PROTECTED_ROUTES.includes(pathname)) {
    const searchParams = new URLSearchParams([["redirectTo", pathname]]);
    return redirect(`${LOGIN_ROUTE}?${searchParams}`);
  }

  if (!user) {
    return json({ user: null });
  }

  // Return only the public user data
  const publicUserData = {
    uid: user.uid,
    email: user.email,
    username: user.username,
  };
  return json({ user: publicUserData });
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
