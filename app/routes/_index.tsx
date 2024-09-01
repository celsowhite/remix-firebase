import { Link } from "@remix-run/react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-8">Remix x Firebase Starter</h1>
      <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
        Login / Signup
      </Link>
    </div>
  );
}
