"use client";

import { useState } from "react";

export default function AddClientPopup({ onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [clientType, setClientType] = useState("energy");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !clientType || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    if (file.type !== "image/webp") {
      alert("Only .webp images are allowed.");
      return;
    }

    setLoading(true);

    // Create FormData and append necessary fields.
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", clientType);
    formData.append("file", file);

    try {
      const res = await fetch("/api/client/addClient", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // onUpdate callback to update state with the new client details.
        onUpdate(data);
      } else {
        alert("Error adding client: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error adding client: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-semibold mb-6">Add New Client</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-2xl mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-2xl p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300"
              placeholder="Enter client name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-2xl mb-1">Type</label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="w-full text-2xl p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300"
              required
            >
              <option value="energy">Energy</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
          </div>
          <div className="mb-8">
            <label className="block text-2xl mb-3">
              Select Client Logo (.webp only)
            </label>
            <input
              id="clientFileInput"
              type="file"
              accept=".webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="clientFileInput"
              className="flex items-center justify-center p-6 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-green-500 transition duration-300"
            >
              <svg
                className="w-10 h-10 mr-3 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16V4m0 0l-3 3m3-3l3 3M17 8v12m0 0l-3-3m3 3l3-3"
                />
              </svg>
              {file ? (
                <span className="text-2xl">{file.name}</span>
              ) : (
                <span className="text-2xl">Click to upload a .webp image</span>
              )}
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mr-4 px-6 py-3 bg-gray-500 text-white rounded text-2xl transition transform hover:scale-105 hover:bg-gray-600 duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded text-2xl transition transform hover:scale-105 hover:bg-green-600 duration-300"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
