"use client";

import { useState, useEffect } from "react";

export default function CareerPopup({ career, onClose, onSave }) {
  // If a career is provided, we are editing; otherwise, adding a new entry.
  const [position, setPosition] = useState(career ? career.position : "");
  const [description, setDescription] = useState(
    career ? career.description : ""
  );
  const [requirements, setRequirements] = useState(
    career ? career.requirements : ""
  );
  const [createdAt, setCreatedAt] = useState(career ? career.created_at : "");
  // careerKey is only relevant when editing.
  const [careerKey, setCareerKey] = useState(career ? career.key : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (career) {
      setPosition(career.position);
      setDescription(career.description);
      setRequirements(career.requirements);
      setCreatedAt(career.created_at);
      setCareerKey(career.key);
    } else {
      setPosition("");
      setDescription("");
      setRequirements("");
      setCreatedAt("");
      setCareerKey(null);
    }
  }, [career]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position) {
      alert("Please provide a position title.");
      return;
    }

    // Build the careerData payload.
    const careerData = {
      position,
      description,
      requirements,
      created_at: createdAt || new Date().toLocaleDateString(),
    };

    // Include the key if editing.
    if (careerKey !== null) {
      careerData.key = careerKey;
    }

    setLoading(true);
    try {
      // Determine which endpoint to use.
      const endpoint = career ? "/api/career/update" : "/api/career/create";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: careerData }),
      });
      const data = await res.json();
      if (res.ok) {
        // onSave receives the returned career entry (including the key if created).
        onSave(data.career);
        onClose();
      } else {
        alert("Error saving changes: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving changes: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow-xl w-full max-w-2xl mx-4">
        <h2 className="text-3xl font-semibold mb-6">
          {career ? "Edit Career" : "Add New Career"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="position" className="block text-2xl mb-2">
              Position
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-2xl"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-2xl mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded text-2xl"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="requirements" className="block text-2xl mb-2">
              Requirements
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded text-2xl"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="created_at" className="block text-2xl mb-2">
              Created At
            </label>
            <input
              type="text"
              id="created_at"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              placeholder="e.g., 01/01/2025"
              className="w-full p-3 border border-gray-300 rounded text-2xl"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded text-2xl transition transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded text-2xl transition transform hover:scale-105"
            >
              {loading ? "Saving..." : "Save Career"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
