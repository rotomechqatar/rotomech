"use client";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  // Card definitions
  const cards = [
    {
      href: "/admin/home",
      title: "Edit Homepage",
      description: "Manage homepage content.",
    },
    {
      href: "/admin/about",
      title: "Edit About Us",
      description: "Manage the about us page.",
    },
    {
      href: "/admin/products-partners",
      title: "Edit Products & Partners",
      description: "Manage products and partner listings.",
    },
    {
      href: "/admin/clients",
      title: "Edit Clients",
      description: "Manage client testimonials and logos.",
    },
    {
      href: "/admin/contact",
      title: "Edit Contact",
      description: "Manage contact information and forms.",
    },
    {
      href: "/admin/careers",
      title: "Edit Careers",
      description: "Manage career opportunities.",
    },
  ];

  return (
    <div className="p-8 bg-gray-800 relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              onClick={() => setLoading(true)}
              className="p-6 bg-white shadow rounded-lg cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-2">{card.title}</h2>
              <p className="text-gray-600 text-lg">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <svg
            className="animate-spin h-16 w-16 text-white"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
