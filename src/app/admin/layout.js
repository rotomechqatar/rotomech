"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "../context/AuthContext"; // adjust the path as needed

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function AdminLayoutContent({ children }) {
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishStatus, setPublishStatus] = useState(""); // "success" or "error"
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMessage("");
    setPublishStatus("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        setPublishMessage(
          "Publish successful! Changes will be live in a few minutes."
        );
        setPublishStatus("success");
        router.refresh();
      } else {
        setPublishMessage(`Error publishing: ${result.error}`);
        setPublishStatus("error");
      }
    } catch (error) {
      setPublishMessage(`Error publishing: ${error.message}`);
      setPublishStatus("error");
    } finally {
      setPublishing(false);
    }
  };

  // Clear the publish message after 5 seconds
  useEffect(() => {
    if (publishMessage) {
      const timer = setTimeout(() => {
        setPublishMessage("");
        setPublishStatus("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [publishMessage]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-gray-100">
          <div className="flex flex-col pt-[15rem] bg-gray-800 px-[10rem]">
            <header className="flex items-center justify-between p-4 h-40 bg-gray-800 text-white">
              <div className="flex items-center gap-4">
                {/* Back button */}
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 text-2xl px-6 py-3 bg-green-600 hover:bg-green-700 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? (
                    <>
                      <span>Publishing...</span>
                      {/* Simple spinner icon */}
                      <svg
                        className="animate-spin h-8 w-8 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    </>
                  ) : (
                    "Publish Changes"
                  )}
                </button>
              )}
            </header>
            {publishMessage && (
              <p
                className={`text-center mt-4 text-2xl font-bold ${
                  publishStatus === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {publishMessage}
              </p>
            )}
            <main className="flex-grow p-4">{children}</main>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
