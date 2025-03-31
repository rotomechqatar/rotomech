"use client";

import { useEffect, useState } from "react";

export default function BannerImageUploadPopup({
  page,
  banner,
  onClose,
  onUpdate,
}) {
  const [name, setName] = useState("");
  const [alt, setAlt] = useState(banner.alt || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prefill the name field by extracting the current filename (without extension)
  useEffect(() => {
    const currentFileName = banner.image ? banner.image.split("/").pop() : "";
    const currentName = currentFileName.replace(".webp", "");
    setName(currentName);
  }, [banner.image]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    setLoading(true);

    // Build a FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("alt", alt);
    formData.append("section", "banner");
    formData.append("file", file);
    formData.append("fileType", file.type);

    try {
      const res = await fetch(`/api/bannerImage/${page}`, {
        method: "POST",
        // Let the browser set the Content-Type for FormData automatically.
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.banner);
      } else {
        alert(
          "Error updating banner image: " + (data.error || "Unknown error")
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error updating banner image: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-semibold mb-6">Upload New Banner Image</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-2xl mb-1">
              Name{" "}
              <span className="text-sm font-light text-gray-500">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-2xl p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300"
              placeholder="Enter image name"
            />
          </div>
          <div className="mb-6">
            <label className="block text-2xl mb-1">
              Alt Text{" "}
              <span className="text-sm font-light text-gray-500">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full text-2xl p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300"
              placeholder="Enter alt text for accessibility"
            />
          </div>
          <div className="mb-8">
            <label className="block text-2xl mb-3">
              Select Image (.webp only)
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
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
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
