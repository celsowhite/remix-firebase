import { ActionFunction, redirect } from "@remix-run/node";
import { getSession, commitSession } from "~/lib/session.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.unset("idToken");
  const cookie = await commitSession(session);

  return redirect("/login", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

export default function SignOut() {
  return null;
}
