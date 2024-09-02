import { ActionFunction, redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/lib/session.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  // Clear the Firebase session cookie
  session.unset("firebaseAuth");

  // Destroy the session to ensure all data is cleared
  const headers = new Headers({
    "Set-Cookie": await destroySession(session),
  });

  return redirect("/login", { headers });
};

export default function SignOut() {
  return null;
}
