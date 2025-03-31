"use client";

import { useState, useEffect } from "react";

export default function AltEditorPopup({
  currentAlt,
  imageIndex,
  section,
  onClose,
  onSave,
}) {
  const [altText, setAltText] = useState(currentAlt);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAltText(currentAlt);
  }, [currentAlt]);

  const handleSave = async () => {
    setLoading(true);
    // Build the payload to update the legacy alt text using the update content route.
    const payload = { [section]: { [`alt${imageIndex}`]: altText } };

    try {
      const res = await fetch(`/api/updateContent/homepage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onSave(altText);
      } else {
        alert("Error updating alt: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error updating alt: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Edit Alt Text</h2>
        <div className="mb-4">
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-2xl"
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
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded text-2xl"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
