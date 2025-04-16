"use client";

import { useState } from "react";

export default function AddProductImagePopup({
  partnerKey,
  onClose,
  onUpdate,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an image file.");
      return;
    }
    // only allow webp
    if (file.type !== "image/webp") {
      alert("Only .webp images are allowed.");
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.append("partnerKey", partnerKey);
    form.append("file", file);

    try {
      const res = await fetch("/api/partner/addProductImage", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (res.ok) {
        onUpdate(json); // { partnerKey, imagePath }
      } else {
        alert("Error uploading image: " + (json.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-md mx-4">
        <h2 className="text-3xl font-semibold mb-6">Add Product Image</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-2xl mb-1">
              Select Image (.webp only)
            </label>
            <input
              type="file"
              accept=".webp"
              onChange={handleFileChange}
              className="w-full text-2xl p-2 border border-gray-300 rounded"
            />
            {file && <p className="mt-2 text-2xl">Selected: {file.name}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-500 text-white rounded text-2xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded text-2xl hover:bg-green-600 transition"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
