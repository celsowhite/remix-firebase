import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";
import { useState } from "react";
import { loader as rootLoader } from "~/root";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useRouteLoaderData<typeof rootLoader>("root");
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user && !isSigningOut) {
    navigate("/login");
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut(auth);
    const response = await fetch("/signout", {
      method: "post",
    });
    if (response.redirected) {
      window.location.href = response.url;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-8">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="mb-8">
        <p className="text-xl">Welcome, {user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
