import { createCookieSessionStorage } from "@remix-run/node";
import { adminAuth, adminDb } from "./firebase.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    },
  });

export async function createFirebaseSession(idToken: string) {
  // Create a session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  return sessionCookie;
}

export async function getUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const firebaseAuthCookie = session.get("firebaseAuth");

  if (!firebaseAuthCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      firebaseAuthCookie,
      true
    );

    // Fetch the user's profile from Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    const userData = userDoc.data();

    return {
      ...decodedClaims,
      ...userData,
    };
  } catch (error) {
    console.error("Error verifying Firebase session cookie:", error);
    return null;
  }
}
