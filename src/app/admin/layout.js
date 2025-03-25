"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "../context/AuthContext"; // adjust the path as needed

function AdminLayoutContent({ children }) {
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMessage("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        setPublishMessage("Publish successful!");
        router.refresh();
      } else {
        setPublishMessage(`Error publishing: ${result.error}`);
      }
    } catch (error) {
      setPublishMessage(`Error publishing: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col my-[15rem]">
      <header className="flex items-center justify-between p-4 h-[10rem] bg-gray-800 text-white">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        {isAuthenticated && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="cursor-pointer text-4xl px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish Changes"}
          </button>
        )}
      </header>
      {publishMessage && (
        <p className="text-center text-red-500 mt-2">{publishMessage}</p>
      )}
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
