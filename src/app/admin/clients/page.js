"use client";

import { useEffect, useState } from "react";

export default function AdminClientsPage() {
  const [data, setData] = useState(null);

  // Fetch clients content on mount
  useEffect(() => {
    fetch("/api/getContent/clients")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  // Handler to update a specific text field in the state
  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  if (!data)
    return (
      <div className="p-6 text-center text-white text-2xl">
        Loading all data. Please wait...
      </div>
    );

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">Clients Editor</h1>
      <SEOSection meta={data.meta} updateText={handleTextUpdate} />
    </div>
  );
}

// SEO Section Component
function SEOSection({ meta, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">SEO Settings</h2>
      <div className="mb-4 text-2xl">
        <p>
          <span className="font-medium">Title: </span>
          <EditableText
            section="meta"
            field="title"
            text={meta.title}
            onTextUpdated={(val) => updateText("meta", "title", val)}
          />
        </p>
        <p>
          <span className="font-medium">Description: </span>
          <EditableText
            section="meta"
            field="description"
            text={meta.description}
            onTextUpdated={(val) => updateText("meta", "description", val)}
          />
        </p>
        <p>
          <span className="font-medium">Keywords: </span>
          <EditableText
            section="meta"
            field="keywords"
            text={meta.keywords}
            onTextUpdated={(val) => updateText("meta", "keywords", val)}
          />
        </p>
      </div>
    </section>
  );
}

// Inline EditableText Component
// This component is reused from your other pages for inline editing.
function EditableText({ section, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  // Synchronize local input value if the text changes externally.
  useEffect(() => {
    setValue(text);
  }, [text]);

  const saveChanges = async () => {
    setLoading(true);
    // Build payload in the format your update route expects:
    // { [section]: { [field]: value } }
    const payload = { [section]: { [field]: value } };

    try {
      const res = await fetch(`/api/updateContent/clients`, {
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
