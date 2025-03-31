"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import CareerPopup from "@/components/admin/CareerPopup";

export default function AdminCareers() {
  const [data, setData] = useState(null);
  const [showCareerPopup, setShowCareerPopup] = useState(false);
  const [editingCareerIndex, setEditingCareerIndex] = useState(null);

  // Fetch careers content data on mount
  useEffect(() => {
    fetch("/api/getContent/careers")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  // Handler to update a specific text field in nested objects (like banner)
  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  // Handler for top-level fields (like noJobs)
  const handleFieldUpdate = (field, newValue) => {
    setData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  // Update an existing career entry at index
  const updateCareer = (index, updatedCareer) => {
    setData((prev) => {
      const updatedCareers = [...prev.careers];
      updatedCareers[index] = updatedCareer;
      return { ...prev, careers: updatedCareers };
    });
  };

  // Add a new career entry
  const addCareer = (newCareer) => {
    setData((prev) => ({
      ...prev,
      careers: prev.careers ? [...prev.careers, newCareer] : [newCareer],
    }));
  };

  if (!data) return <div className="p-6 text-center text-2xl">Loading...</div>;

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">
        Admin Dashboard - Careers Editor
      </h1>

      <BannerSection
        banner={data.banner}
        updateText={handleTextUpdate}
        page="careers"
      />

      <NoJobsSection noJobs={data.noJobs} updateField={handleFieldUpdate} />

      <CareersSection
        careers={data.careers}
        updateCareer={updateCareer}
        openCareerPopup={(index) => {
          setEditingCareerIndex(index);
          setShowCareerPopup(true);
        }}
      />

      {(!data.careers || data.careers.length === 0) && (
        <div className="mt-8">
          <button
            onClick={() => {
              setEditingCareerIndex(null);
              setShowCareerPopup(true);
            }}
            className="px-6 py-3 bg-green-500 text-white rounded text-2xl"
          >
            Add New Career
          </button>
        </div>
      )}

      {showCareerPopup && (
        <CareerPopup
          career={
            editingCareerIndex !== null
              ? data.careers[editingCareerIndex]
              : null
          }
          onClose={() => {
            setShowCareerPopup(false);
            setEditingCareerIndex(null);
          }}
          onSave={(careerData) => {
            if (editingCareerIndex !== null) {
              updateCareer(editingCareerIndex, careerData);
            } else {
              addCareer(careerData);
            }
            setShowCareerPopup(false);
            setEditingCareerIndex(null);
          }}
        />
      )}
    </div>
  );
}

// -----------------------
// Banner Section
// -----------------------
function BannerSection({ banner, updateText, page }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);

  const openPopup = () => setShowUploadPopup(true);
  const closePopup = () => setShowUploadPopup(false);

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Banner Section</h2>
      <div className="mb-4">
        <Image
          src={banner.image}
          alt={banner.alt}
          width={300}
          height={150}
          objectFit="cover"
          className="rounded"
        />
      </div>
      <button
        onClick={openPopup}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 text-2xl"
      >
        Upload New Banner Image
      </button>
      <div className="text-2xl">
        <p className="font-medium">
          <EditableText
            section="banner"
            field="tagline"
            text={banner.tagline}
            onTextUpdated={(val) => updateText("banner", "tagline", val)}
          />
        </p>
        <p className="text-gray-600">
          <EditableText
            section="banner"
            field="sub"
            text={banner.sub}
            onTextUpdated={(val) => updateText("banner", "sub", val)}
          />
        </p>
      </div>
      {showUploadPopup && (
        <BannerImageUploadPopup
          page={page}
          banner={banner}
          onClose={closePopup}
          onUpdate={(newBanner) => {
            updateText("banner", "image", newBanner.image);
            updateText("banner", "alt", newBanner.alt);
            closePopup();
          }}
        />
      )}
    </section>
  );
}

// -----------------------
// No Jobs Section
// -----------------------
function NoJobsSection({ noJobs, updateField }) {
  const displayText = typeof noJobs === "object" ? noJobs.message : noJobs;
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">No Jobs Message</h2>
      <p className="text-2xl">
        <EditableText
          section="noJobs"
          field="message"
          text={displayText}
          onTextUpdated={(val) => updateField("noJobs", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// Careers Section
// -----------------------
function CareersSection({ careers, updateCareer, openCareerPopup }) {
  if (!careers || careers.length === 0) {
    return (
      <section className="mb-8 p-6 bg-white rounded shadow text-2xl">
        No careers available.
      </section>
    );
  }

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Careers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-2xl border">Position</th>
              <th className="p-2 text-2xl border">Description</th>
              <th className="p-2 text-2xl border">Requirements</th>
              <th className="p-2 text-2xl border">Created At</th>
              <th className="p-2 text-2xl border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {careers.map((career, index) => (
              <tr key={career.key || index} className="text-center">
                <td className="p-2 border text-2xl">{career.position}</td>
                <td className="p-2 border text-2xl">{career.description}</td>
                <td className="p-2 border text-2xl">{career.requirements}</td>
                <td className="p-2 border text-2xl">{career.created_at}</td>
                <td className="p-2 border text-2xl">
                  <button
                    onClick={() => openCareerPopup(index)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-2xl"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button
          onClick={() => openCareerPopup(null)}
          className="px-6 py-3 bg-green-500 text-white rounded text-2xl"
        >
          Add New Career
        </button>
      </div>
    </section>
  );
}

// -----------------------
// Editable Text Component
// -----------------------
function EditableText({ section, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const saveChanges = async () => {
    setLoading(true);
    const payload = { [section]: { [field]: value } };

    try {
      const res = await fetch(`/api/updateContent/careers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onTextUpdated(value);
        setEditing(false);
      } else {
        alert("Error saving changes: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving changes: " + err.message);
    }
    setLoading(false);
  };

  const cancelEditing = () => {
    setValue(text);
    setEditing(false);
  };

  return (
    <span className="w-full inline-flex items-center">
      {editing ? (
        <>
          <input
            type="text"
            className="flex-grow text-2xl p-2 border border-gray-300 rounded"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={saveChanges}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded text-2xl"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={cancelEditing}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded text-2xl"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-2xl">{text}</span>
          <span
            onClick={() => setEditing(true)}
            className="cursor-pointer text-2xl ml-1 inline"
          >
            ✏️
          </span>
        </>
      )}
    </span>
  );
}
