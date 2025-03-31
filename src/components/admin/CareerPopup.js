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
      const endpoint = career ? "/api/career/update" : "/api/career/create";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: careerData }),
      });
      const data = await res.json();
      if (res.ok) {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-[70vw] mx-auto transform transition-all duration-300 hover:scale-105">
        <h2 className="text-4xl font-bold mb-8 text-center">
          {career ? "Edit Career" : "Add New Career"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="position"
              className="block text-2xl font-semibold mb-2"
            >
              Position
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-2xl font-semibold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="requirements"
              className="block text-2xl font-semibold mb-2"
            >
              Requirements
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows="4"
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="created_at"
              className="block text-2xl font-semibold mb-2"
            >
              Created At
            </label>
            <input
              type="text"
              id="created_at"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              placeholder="e.g., 01/01/2025"
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex justify-end space-x-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-gray-600 text-white rounded-lg text-2xl transition-all duration-300 hover:bg-gray-700 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-green-600 text-white rounded-lg text-2xl transition-all duration-300 hover:bg-green-700 hover:scale-105"
            >
              {loading ? "Saving..." : "Save Career"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
