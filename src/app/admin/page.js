"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/admin/home">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">Edit Homepage</h2>
            <p className="text-gray-600">Manage homepage content.</p>
          </div>
        </Link>
        <Link href="/admin/about">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">Edit About Us</h2>
            <p className="text-gray-600">Manage the about us page.</p>
          </div>
        </Link>
        <Link href="/admin/products-partners">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">
              Edit Products &amp; Partners
            </h2>
            <p className="text-gray-600">
              Manage products and partner listings.
            </p>
          </div>
        </Link>
        <Link href="/admin/clients">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">Edit Clients</h2>
            <p className="text-gray-600">
              Manage client testimonials and logos.
            </p>
          </div>
        </Link>
        <Link href="/admin/contact">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">Edit Contact</h2>
            <p className="text-gray-600">
              Manage contact information and forms.
            </p>
          </div>
        </Link>
        <Link href="/admin/careers">
          <div className="p-6 bg-white shadow rounded cursor-pointer hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">Edit Careers</h2>
            <p className="text-gray-600">Manage career opportunities.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
