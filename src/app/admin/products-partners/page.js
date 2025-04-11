"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import AddPartnerPopup from "@/components/admin/AddPartnerPopup";

// Main Page Component
export default function AdminProductsPartnersPage() {
  const [data, setData] = useState(null);

  // Fetch products & partners content on mount
  useEffect(() => {
    fetch("/api/getContent/products-and-partners")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  // Handler for general (non-nested) updates
  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  // Handler to update a field in a partner object.
  // Use the key from your partners object (which is "0", "1", ...).
  const handlePartnerFieldUpdate = (partnerKey, field, newValue) => {
    setData((prev) => ({
      ...prev,
      partners: {
        ...prev.partners,
        [partnerKey]: {
          ...prev.partners[partnerKey],
          [field]: newValue,
        },
      },
    }));
  };

  // When adding a new partner, determine the next key.
  const updatePartners = (newPartner) => {
    setData((prev) => {
      const newPartners = { ...prev.partners };
      const nextKey = Object.keys(newPartners).length.toString();
      newPartners[nextKey] = newPartner;
      return { ...prev, partners: newPartners };
    });
  };

  // Remove partner by matching partner name.
  const removePartner = (partnerName) => {
    setData((prev) => {
      const newPartners = { ...prev.partners };
      for (const key in newPartners) {
        if (newPartners[key].name === partnerName) {
          delete newPartners[key];
        }
      }
      return { ...prev, partners: newPartners };
    });
  };

  if (!data) return <div className="p-6 text-center text-2xl">Loading...</div>;

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">Products & Partners Editor</h1>

      <BannerSection banner={data.banner} updateText={handleTextUpdate} />
      <PartnersSection
        partners={data.partners}
        handlePartnerFieldUpdate={handlePartnerFieldUpdate}
        updatePartners={updatePartners}
        removePartner={removePartner}
      />
      <SEOSection meta={data.meta} updateText={handleTextUpdate} />
    </div>
  );
}

// -----------------------
// Banner Section (unchanged)
// -----------------------
function BannerSection({ banner, updateText }) {
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
        Upload New Image
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
          page="products-and-partners"
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
// Partners Section (Cards)
// -----------------------
function PartnersSection({
  partners,
  handlePartnerFieldUpdate,
  updatePartners,
  removePartner,
}) {
  const [showAddPartnerPopup, setShowAddPartnerPopup] = useState(false);

  // Delete handler for a partner.
  const handleDeletePartner = async (partnerName) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      const res = await fetch("/api/partner/deletePartner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: partnerName }),
      });
      const data = await res.json();
      if (res.ok) {
        removePartner(partnerName);
      } else {
        alert("Error deleting partner: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting partner: " + err.message);
    }
  };

  // Convert partners object to an array of [key, partner] entries.
  const partnerEntries = Object.entries(partners);

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Our Partners</h2>
        <button
          onClick={() => setShowAddPartnerPopup(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-2xl"
        >
          Add Partner
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {partnerEntries.map(([key, partner]) => (
          <PartnerCard
            key={key}
            index={key}
            partner={partner}
            handlePartnerFieldUpdate={handlePartnerFieldUpdate}
            onDelete={() => handleDeletePartner(partner.name)}
          />
        ))}
      </div>
      {showAddPartnerPopup && (
        <AddPartnerPopup
          onClose={() => setShowAddPartnerPopup(false)}
          onUpdate={(newPartner) => {
            updatePartners(newPartner);
            setShowAddPartnerPopup(false);
          }}
        />
      )}
    </section>
  );
}

// A card for each partner with editable fields using PartnerEditableText.
function PartnerCard({ index, partner, handlePartnerFieldUpdate, onDelete }) {
  return (
    <div className="p-6 bg-gray-100 rounded shadow flex flex-col md:flex-row md:items-center gap-4">
      <div className="relative w-full md:w-1/4 h-48">
        <Image
          src={partner.logo}
          alt={partner.name + " logo"}
          layout="fill"
          objectFit="contain"
          className="rounded"
        />
      </div>
      <div className="flex flex-col gap-2 flex-grow">
        <h3 className="text-3xl font-semibold">
          <PartnerEditableText
            index={index}
            field="name"
            text={partner.name}
            onTextUpdated={(newValue) =>
              handlePartnerFieldUpdate(index, "name", newValue)
            }
          />
        </h3>
        <p className="text-2xl">
          <PartnerEditableText
            index={index}
            field="description"
            text={partner.description}
            onTextUpdated={(newValue) =>
              handlePartnerFieldUpdate(index, "description", newValue)
            }
          />
        </p>
        <p className="text-2xl">
          <PartnerEditableText
            index={index}
            field="link"
            text={partner.link}
            onTextUpdated={(newValue) =>
              handlePartnerFieldUpdate(index, "link", newValue)
            }
          />
        </p>
        <div>
          <a
            href={partner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-2xl"
          >
            Visit
          </a>
        </div>
      </div>
      <div>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500 text-white rounded text-2xl"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// -----------------------
// SEO Section (unchanged)
// -----------------------
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

// -----------------------
// EditableText Component (for one-level updates)
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
      const res = await fetch(`/api/updateContent/products-and-partners`, {
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

// -----------------------
// PartnerEditableText Component (for nested partner updates)
// -----------------------
function PartnerEditableText({ index, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const saveChanges = async () => {
    setLoading(true);
    // Build a nested payload using the partner's key (index) and a fixed field name.
    const payload = {
      partners: { [index]: { [field]: value } },
    };

    try {
      const res = await fetch(`/api/updateContent/products-and-partners`, {
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
