"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext"; // adjust the path as needed

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsAuthenticated(true);
      router.push("/admin");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-white/95 shadow-xl rounded-xl px-8 py-12 max-w-md w-full text-center transform transition-transform duration-300 hover:-translate-y-1">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Login</h1>
        {error && (
          <p className="text-red-500 text-lg font-semibold mb-6">{error}</p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-start">
            <label htmlFor="username" className="text-lg text-gray-600 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-colors"
            />
          </div>
          <div className="flex flex-col items-start">
            <label htmlFor="password" className="text-lg text-gray-600 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-xl font-semibold text-white bg-blue-600 rounded-lg transition-transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
