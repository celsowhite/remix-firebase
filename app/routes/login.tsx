import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "~/lib/firebase";
import { Form, useActionData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  redirect,
  LoaderFunction,
} from "@remix-run/node";
import { getSession, commitSession, getUserId } from "~/lib/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/dashboard");
  }
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const idToken = formData.get("idToken") as string;

  try {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("idToken", idToken);
    const cookie = await commitSession(session);

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("Error setting session", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return json({ error: errorMessage }, { status: 400 });
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const actionData = useActionData<typeof action>();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
      const idToken = await userCredential.user.getIdToken();
      const form = event.currentTarget;
      const formData = new FormData(form);
      formData.set("idToken", idToken);
      const action = form.action;
      const method = form.method;
      const response = await fetch(action, {
        method,
        body: formData,
      });
      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error during authentication", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      const formData = new FormData();
      formData.set("idToken", idToken);
      const response = await fetch("/login", {
        method: "post",
        body: formData,
      });
      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">
        {isSignUp ? "Sign Up" : "Login / Signup"}
      </h1>
      <Form
        method="post"
        className="flex flex-col items-center"
        onSubmit={handleSignIn}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <input type="hidden" name="isSignUp" value={isSignUp.toString()} />
        {isSignUp ? (
          <button
            type="submit"
            className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Sign Up with Email/Password
          </button>
        ) : (
          <>
            <button
              type="submit"
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Sign In with Email/Password
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mb-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Sign In with Google
            </button>
          </>
        )}
      </Form>
      {actionData?.error && (
        <p className="text-red-500 mt-4">{actionData.error}</p>
      )}
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-500 underline"
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
