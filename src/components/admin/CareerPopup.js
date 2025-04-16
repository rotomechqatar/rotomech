"use client";

import { useState, useEffect } from "react";

export default function CareerPopup({ career, onClose, onSave }) {
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [whatWeOffer, setWhatWeOffer] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [careerKey, setCareerKey] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (career) {
      setPosition(career.position);
      setLocation(career.location);
      setDescription(career.description);
      setKeyResponsibilities(career.keyResponsibilities.join(", "));
      setQualifications(career.qualifications.join(", "));
      setWhatWeOffer(career.whatWeOffer.join(", "));
      setCreatedAt(career.created_at);
      setCareerKey(career.key);
    } else {
      setPosition("");
      setLocation("");
      setDescription("");
      setKeyResponsibilities("");
      setQualifications("");
      setWhatWeOffer("");
      setCreatedAt("");
      setCareerKey(null);
    }
  }, [career]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position || !location) {
      alert("Position and location are required.");
      return;
    }
    setLoading(true);

    // Convert comma‑separated strings into arrays
    const payload = {
      position,
      location,
      description,
      keyResponsibilities: keyResponsibilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: qualifications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      whatWeOffer: whatWeOffer
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      created_at: createdAt || new Date().toLocaleDateString(),
    };
    if (careerKey !== null) payload.key = careerKey;

    try {
      const endpoint = career ? "/api/career/update" : "/api/career/create";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: payload }),
      });
      const json = await res.json();
      if (res.ok) {
        onSave(json.career);
      } else {
        alert(json.error || "Error saving career");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[80vw] max-w-3xl">
        <h2 className="text-4xl font-bold mb-8 text-center">
          {career ? "Edit Career" : "Add New Career"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: "Position", value: position, setter: setPosition },
            { label: "Location", value: location, setter: setLocation },
            {
              label: "Description",
              value: description,
              setter: setDescription,
            },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-2xl font-semibold mb-2">
                {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-4 border-2 rounded-lg text-2xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          {[
            {
              label: "Key Responsibilities (comma separated)",
              value: keyResponsibilities,
              setter: setKeyResponsibilities,
            },
            {
              label: "Qualifications (comma separated)",
              value: qualifications,
              setter: setQualifications,
            },
            {
              label: "What We Offer (comma separated)",
              value: whatWeOffer,
              setter: setWhatWeOffer,
            },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-2xl font-semibold mb-2">
                {label}
              </label>
              <textarea
                value={value}
                onChange={(e) => setter(e.target.value)}
                rows="3"
                className="w-full p-4 border-2 rounded-lg text-2xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-2xl font-semibold mb-2">
              Created At
            </label>
            <input
              type="text"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full p-4 border-2 rounded-lg text-2xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-4 bg-gray-600 text-white rounded-lg text-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-green-600 text-white rounded-lg text-2xl"
            >
              {loading ? "Saving..." : "Save Career"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
