"use client";

import { useState } from "react";

export default function AddPartnerPopup({ onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [productFiles, setProductFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
  };

  const handleProductsChange = (e) => {
    if (e.target.files) {
      setProductFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!name || !description || !logoFile || productFiles.length === 0) {
      alert(
        "Please fill all fields, select a logo, and at least one product image."
      );
      return;
    }
    if (logoFile.type !== "image/webp") {
      alert("Only .webp logos are allowed.");
      return;
    }
    if (productFiles.some((f) => f.type !== "image/webp")) {
      alert("Only .webp product images are allowed.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", logoFile);
    productFiles.forEach((f) => formData.append("productImages", f));

    try {
      const res = await fetch("/api/partner/addPartner", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data);
      } else {
        alert("Error adding partner: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error adding partner: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-semibold mb-6">Add New Partner</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-2xl mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-2xl p-3 border rounded focus:ring-2 focus:ring-green-300"
              placeholder="Enter partner name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-2xl mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-2xl p-3 border rounded focus:ring-2 focus:ring-green-300"
              placeholder="Enter description"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-2xl mb-1">
              Partner Logo (.webp only)
            </label>
            <input
              id="logoInput"
              type="file"
              accept=".webp"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="logoInput"
              className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition"
            >
              {logoFile ? (
                <span className="text-2xl">{logoFile.name}</span>
              ) : (
                <span className="text-2xl">Click to upload logo</span>
              )}
            </label>
          </div>
          <div className="mb-8">
            <label className="block text-2xl mb-1">
              Product Images (.webp only, min 1)
            </label>
            <input
              id="productsInput"
              type="file"
              accept=".webp"
              multiple
              onChange={handleProductsChange}
              className="hidden"
            />
            <label
              htmlFor="productsInput"
              className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition"
            >
              {productFiles.length ? (
                <span className="text-2xl">
                  {productFiles.length} file(s) selected
                </span>
              ) : (
                <span className="text-2xl">Click to select product images</span>
              )}
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mr-4 px-6 py-3 bg-gray-500 text-white rounded text-2xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded text-2xl hover:bg-green-600 transition"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
