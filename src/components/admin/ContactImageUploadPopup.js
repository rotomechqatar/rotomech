"use client";

import { useState, useEffect } from "react";

export default function ContactImageUploadPopup({
  page,
  section,
  index, // optional: image index to update
  initialName = "", // optional initial name value
  onClose,
  onUpload,
}) {
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prepopulate the name field if initialName changes.
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

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
      const base64data = reader.result.split(",")[1];

      // Build payload. For Contact Us images, we do not include an alt field.
      const payload = {
        imageBase64: base64data,
        section,
      };
      if (name) payload.name = name;
      if (index !== undefined) payload.index = index;

      try {
        const res = await fetch(`/api/image/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          onUpload({
            imagePath: data.imagePath,
            index: index !== undefined ? index : data.index,
            name: name || "",
          });
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-semibold mb-6">
          {index !== undefined ? "Update Image" : "Upload Image"}
        </h2>
        <p className="mb-4 text-2xl">
          Page: <strong>{page}</strong>, Section: <strong>{section}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-2xl mb-3">
              Select Image (.webp only)
            </label>
            <input
              id="fileInputContact"
              type="file"
              accept="image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="fileInputContact"
              className="flex items-center justify-center p-6 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-green-500 transition duration-300"
            >
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
