"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import CareerPopup from "@/components/admin/CareerPopup";

export default function AdminCareers() {
  const [data, setData] = useState(null);
  const [showCareerPopup, setShowCareerPopup] = useState(false);
  const [editingCareerIndex, setEditingCareerIndex] = useState(null);

  useEffect(() => {
    fetch("/api/getContent/careers")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  const handleFieldUpdate = (field, newValue) => {
    setData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const updateCareer = (index, updatedCareer) => {
    setData((prev) => {
      const updatedCareers = [...prev.careers];
      updatedCareers[index] = updatedCareer;
      return { ...prev, careers: updatedCareers };
    });
  };

  const addCareer = (newCareer) => {
    setData((prev) => ({
      ...prev,
      careers: prev.careers ? [...prev.careers, newCareer] : [newCareer],
    }));
  };

  const deleteCareer = async (index, key) => {
    if (!confirm("Are you sure you want to delete this career posting?")) {
      return;
    }
    try {
      const res = await fetch("/api/career/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const result = await res.json();
      if (res.ok) {
        setData((prev) => {
          const updatedCareers = prev.careers.filter((_, i) => i !== index);
          return { ...prev, careers: updatedCareers };
        });
      } else {
        alert("Error deleting career: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting career: " + err.message);
    }
  };

  if (!data)
    return (
      <div className="p-6 text-center text-white text-2xl">
        Loading all data. Please wait...
      </div>
    );

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">Careers Editor</h1>

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
        deleteCareer={deleteCareer}
      />

      {/* Always show the Add New Career button */}
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

      <SEOSection meta={data.meta} updateText={handleTextUpdate} />
    </div>
  );
}

function BannerSection({ banner, updateText, page }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);

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
        onClick={() => setShowUploadPopup(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 text-2xl"
      >
        Upload New Banner Image
      </button>
      <div className="text-2xl">
        <EditableText
          section="banner"
          field="tagline"
          text={banner.tagline}
          onTextUpdated={(val) => updateText("banner", "tagline", val)}
        />
        <EditableText
          section="banner"
          field="sub"
          text={banner.sub}
          onTextUpdated={(val) => updateText("banner", "sub", val)}
        />
      </div>
      {showUploadPopup && (
        <BannerImageUploadPopup
          page={page}
          banner={banner}
          onClose={() => setShowUploadPopup(false)}
          onUpdate={(newBanner) => {
            updateText("banner", "image", newBanner.image);
            updateText("banner", "alt", newBanner.alt);
            setShowUploadPopup(false);
          }}
        />
      )}
    </section>
  );
}

function NoJobsSection({ noJobs, updateField }) {
  const message = typeof noJobs === "object" ? noJobs.message : noJobs;
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">No Jobs Message</h2>
      <EditableText
        section="noJobs"
        field="message"
        text={message}
        onTextUpdated={(val) => updateField("noJobs", { message: val })}
      />
    </section>
  );
}

function CareersSection({
  careers,
  updateCareer,
  openCareerPopup,
  deleteCareer,
}) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Careers</h2>
      {!careers || careers.length === 0 ? (
        <p className="text-2xl">No careers available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-2xl border">Position</th>
                <th className="p-2 text-2xl border">Location</th>
                <th className="p-2 text-2xl border">Description</th>
                <th className="p-2 text-2xl border">Responsibilities</th>
                <th className="p-2 text-2xl border">Qualifications</th>
                <th className="p-2 text-2xl border">What We Offer</th>
                <th className="p-2 text-2xl border">Created At</th>
                <th className="p-2 text-2xl border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((c, index) => (
                <tr key={c.key || index} className="text-center">
                  <td className="p-2 border text-2xl">{c.position}</td>
                  <td className="p-2 border text-2xl">{c.location || "-"}</td>
                  <td className="p-2 border text-2xl">{c.description}</td>
                  <td className="p-2 border text-2xl">
                    {(c.keyResponsibilities || []).join(", ")}
                  </td>
                  <td className="p-2 border text-2xl">
                    {(c.qualifications || []).join(", ")}
                  </td>
                  <td className="p-2 border text-2xl">
                    {(c.whatWeOffer || []).join(", ")}
                  </td>
                  <td className="p-2 border text-2xl">{c.created_at}</td>
                  <td className="p-2 border text-2xl space-x-2">
                    <button
                      onClick={() => openCareerPopup(index)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCareer(index, c.key)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SEOSection({ meta, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">SEO Settings</h2>
      <div className="mb-4 text-2xl">
        <EditableText
          section="meta"
          field="title"
          text={meta.title}
          onTextUpdated={(val) => updateText("meta", "title", val)}
        />
        <EditableText
          section="meta"
          field="description"
          text={meta.description}
          onTextUpdated={(val) => updateText("meta", "description", val)}
        />
        <EditableText
          section="meta"
          field="keywords"
          text={meta.keywords}
          onTextUpdated={(val) => updateText("meta", "keywords", val)}
        />
      </div>
    </section>
  );
}

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

  return (
    <span className="inline-flex items-center">
      {editing ? (
        <>
          <input
            type="text"
            className="text-2xl p-2 border border-gray-300 rounded"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={saveChanges}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-2xl">{text}</span>
          <span
            onClick={() => setEditing(true)}
            className="cursor-pointer text-2xl ml-1"
          >
            ✏️
          </span>
        </>
      )}
    </span>
  );
}
