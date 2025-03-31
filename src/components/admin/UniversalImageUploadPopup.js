"use client";

import { useState, useEffect } from "react";

export default function UniversalImageUploadPopup({
  page,
  section,
  index, // optional: the image index to update (if updating an existing image)
  initialName = "", // optional initial name value
  initialAlt = "", // optional initial alt value
  onClose,
  onUpload,
}) {
  const [name, setName] = useState(initialName);
  const [alt, setAlt] = useState(initialAlt);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prepopulate fields if initial values change.
  useEffect(() => {
    setName(initialName);
    setAlt(initialAlt);
  }, [initialName, initialAlt]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    setLoading(true);

    // Read the file as a base64 string.
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Remove the data URI prefix from the result.
      const base64data = reader.result.split(",")[1];

      // Build payload. If name or alt aren't provided, they won't override existing values.
      const payload = {
        imageBase64: base64data,
        section,
      };
      if (name) payload.name = name;
      if (alt) payload.alt = alt;
      if (index !== undefined) payload.index = index;

      try {
        const res = await fetch(`/api/image/upload/${page}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          // onUpload expects the new imagePath, index, alt, and name.
          onUpload({ imagePath: data.imagePath, index: data.index, alt, name });
          onClose();
        } else {
          alert("Error uploading image: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        alert("Error uploading image: " + err.message);
      }
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">
          {index !== undefined ? "Update Image" : "Upload Image"}
        </h2>
        <p className="mb-2">
          Page: <strong>{page}</strong>, Section: <strong>{section}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-2xl mb-1">
              Name <span className="text-sm">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leave blank to keep current name"
              className="w-full p-2 border border-gray-300 rounded text-2xl"
            />
          </div>
          <div className="mb-4">
            <label className="block text-2xl mb-1">
              Alt Text <span className="text-sm">(optional)</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Leave blank to keep current alt text"
              className="w-full p-2 border border-gray-300 rounded text-2xl"
            />
          </div>
          <div className="mb-4">
            <label className="block text-2xl mb-1">Image (WebP only)</label>
            <input
              type="file"
              accept="image/webp"
              onChange={handleFileChange}
              className="w-full text-2xl"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded text-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded text-2xl"
            >
              {loading
                ? index !== undefined
                  ? "Updating..."
                  : "Uploading..."
                : index !== undefined
                ? "Update"
                : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
