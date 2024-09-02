import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getUser } from "~/lib/session.server";
import { adminDb } from "~/lib/firebase.server";
import { useState } from "react";

export async function loader({
  params,
  request,
}: {
  params: { userId: string };
  request: Request;
}) {
  const user = await getUser(request);
  const isAuthenticated = !!user;

  // Try to find the user by username. This will be their uid upon creation but they can change it.
  const profileUserSnapshot = await adminDb
    .collection("users")
    .where("username", "==", params.userId)
    .limit(1)
    .get();

  if (profileUserSnapshot.empty) {
    throw new Response("User not found", { status: 404 });
  }

  const profileUserData = profileUserSnapshot.docs[0]?.data();
  const profileUserId = profileUserSnapshot.docs[0]?.id;

  const profileUser = {
    email: profileUserData?.email,
    uid: profileUserId,
    username: profileUserData?.username || profileUserId,
  };

  return json({
    user: isAuthenticated ? { email: user.email || "", uid: user.uid } : null,
    profileUser,
    isAuthenticated,
  });
}

export default function UserProfile() {
  const { user, profileUser, isAuthenticated } = useLoaderData<typeof loader>();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const response = await fetch("/signout", {
      method: "post",
    });

    if (response.redirected) {
      window.location.href = response.url;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-20">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        <div className="mb-8">
          <p className="text-xl">Email: {profileUser.email}</p>
          <p className="text-xl">Username: {profileUser.username}</p>
        </div>
        {isAuthenticated && user?.uid === profileUser.uid && (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        )}
      </div>
    </div>
  );
}
