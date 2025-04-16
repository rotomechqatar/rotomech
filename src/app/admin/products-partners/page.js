"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import AddPartnerPopup from "@/components/admin/AddPartnerPopup";
import AddProductImagePopup from "@/components/admin/AddProductImagePopup";

// Global message overlay
function GlobalMessage({ message, type }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`p-6 rounded shadow-lg text-2xl text-white ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

export default function AdminProductsPartnersPage() {
  const [data, setData] = useState(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalType, setGlobalType] = useState("success");

  const showGlobalMessage = (msg, type = "success") => {
    setGlobalMessage(msg);
    setGlobalType(type);
    setTimeout(() => setGlobalMessage(""), 3000);
  };

  useEffect(() => {
    fetch("/api/getContent/products-and-partners")
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

  const handlePartnerFieldUpdate = (key, field, newValue) => {
    setData((prev) => ({
      ...prev,
      partners: {
        ...prev.partners,
        [key]: { ...prev.partners[key], [field]: newValue },
      },
    }));
  };

  const updatePartners = (newPartner) =>
    setData((prev) => {
      const nextKey = Object.keys(prev.partners).length.toString();
      return {
        ...prev,
        partners: { ...prev.partners, [nextKey]: newPartner },
      };
    });

  const removePartner = (name) =>
    setData((prev) => {
      const updated = { ...prev.partners };
      Object.keys(updated).forEach((k) => {
        if (updated[k].name === name) delete updated[k];
      });
      return { ...prev, partners: updated };
    });

  const addProductImage = ({ key, imagePath }) =>
    setData((prev) => {
      const imgs = prev.partners[key].images || [];
      return {
        ...prev,
        partners: {
          ...prev.partners,
          [key]: { ...prev.partners[key], images: [...imgs, imagePath] },
        },
      };
    });

  const removeProductImage = (partnerKey, imageSrc) =>
    setData((prev) => {
      const imgs = prev.partners[partnerKey].images.filter(
        (i) => i !== imageSrc
      );
      return {
        ...prev,
        partners: {
          ...prev.partners,
          [partnerKey]: { ...prev.partners[partnerKey], images: imgs },
        },
      };
    });

  if (!data)
    return (
      <div className="p-6 text-center text-white text-2xl">
        Loading all data. Please wait...
      </div>
    );

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      {globalMessage && (
        <GlobalMessage message={globalMessage} type={globalType} />
      )}
      <h1 className="text-5xl font-bold mb-8">Products & Partners Editor</h1>

      <BannerSection banner={data.banner} updateText={handleTextUpdate} />

      <PartnersSection
        partners={data.partners}
        onUpdateField={handlePartnerFieldUpdate}
        onAddPartner={updatePartners}
        onRemovePartner={removePartner}
        onAddImage={addProductImage}
        onRemoveImage={removeProductImage}
        showMessage={showGlobalMessage}
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

// -----------------------
// Partners Section
// -----------------------
function PartnersSection({
  partners,
  onUpdateField,
  onAddPartner,
  onRemovePartner,
  onAddImage,
  onRemoveImage,
  showMessage,
}) {
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [addImageKey, setAddImageKey] = useState(null);

  const handleDeletePartner = async (name) => {
    if (!confirm(`Delete partner "${name}"?`)) return;
    try {
      const res = await fetch("/api/partner/deletePartner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: name }),
      });
      const json = await res.json();
      if (res.ok) {
        onRemovePartner(name);
        showMessage("Partner deleted successfully!", "success");
      } else {
        showMessage(json.error || "Error deleting partner", "error");
      }
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Our Partners</h2>
        <button
          onClick={() => setShowAddPartner(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded text-2xl"
        >
          Add Partner
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(partners).map(([key, partner]) => (
          <PartnerCard
            key={key}
            index={key}
            partner={partner}
            onUpdateField={onUpdateField}
            onDelete={() => handleDeletePartner(partner.name)}
            onAddImage={() => setAddImageKey(key)}
            onRemoveImage={(src) => onRemoveImage(key, src)}
            showMessage={showMessage}
          />
        ))}
      </div>

      {showAddPartner && (
        <AddPartnerPopup
          onClose={() => setShowAddPartner(false)}
          onUpdate={(p) => {
            onAddPartner(p);
            showMessage("Partner added!", "success");
            setShowAddPartner(false);
          }}
        />
      )}

      {addImageKey != null && (
        <AddProductImagePopup
          partnerKey={addImageKey}
          onClose={() => setAddImageKey(null)}
          onUpdate={({ imagePath }) => {
            onAddImage({ key: addImageKey, imagePath });
            showMessage("Image uploaded!", "success");
            setAddImageKey(null);
          }}
        />
      )}
    </section>
  );
}

// -----------------------
// Partner Card
// -----------------------
function PartnerCard({
  index,
  partner,
  onUpdateField,
  onDelete,
  onAddImage,
  onRemoveImage,
  showMessage,
}) {
  const [deletingSrc, setDeletingSrc] = useState(null);

  const handleDeleteImage = async (src) => {
    if (!confirm("Delete this product image?")) return;
    setDeletingSrc(src);
    try {
      const res = await fetch("/api/partner/deleteProductImage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerKey: index, imagePath: src }),
      });
      const json = await res.json();
      if (res.ok) {
        onRemoveImage(index, src);
        showMessage("Image deleted!", "success");
      } else {
        showMessage(json.error || "Error deleting image", "error");
      }
    } catch (err) {
      showMessage(err.message, "error");
    }
    setDeletingSrc(null);
  };

  return (
    <div className="p-6 bg-gray-100 rounded shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/4 h-48">
          <Image
            src={partner.logo}
            alt={partner.name + " logo"}
            layout="fill"
            objectFit="contain"
            className="rounded"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-3xl font-semibold">
            <PartnerEditableText
              index={index}
              field="name"
              text={partner.name}
              onTextUpdated={(v) => onUpdateField(index, "name", v)}
            />
          </h3>
          <p className="text-2xl">
            <PartnerEditableText
              index={index}
              field="description"
              text={partner.description}
              onTextUpdated={(v) => onUpdateField(index, "description", v)}
            />
          </p>
        </div>

        <div className="flex flex-col justify-between">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded text-2xl mb-2"
          >
            Delete Partner
          </button>
          <button
            onClick={onAddImage}
            className="px-4 py-2 bg-green-500 text-white rounded text-2xl"
          >
            Add Product Image
          </button>
        </div>
      </div>

      {partner.images?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          {partner.images.map((src, idx) => (
            <div key={idx} className="relative w-full h-40">
              <Image
                src={src}
                alt={`Product ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
              <button
                onClick={() => handleDeleteImage(src)}
                disabled={deletingSrc === src}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                {deletingSrc === src ? "Deleting..." : "Delete Image"}
              </button>
            </div>
          ))}
        </div>
      )}
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
            onTextUpdated={(v) => updateText("meta", "title", v)}
          />
        </p>
        <p>
          <span className="font-medium">Description: </span>
          <EditableText
            section="meta"
            field="description"
            text={meta.description}
            onTextUpdated={(v) => updateText("meta", "description", v)}
          />
        </p>
        <p>
          <span className="font-medium">Keywords: </span>
          <EditableText
            section="meta"
            field="keywords"
            text={meta.keywords}
            onTextUpdated={(v) => updateText("meta", "keywords", v)}
          />
        </p>
      </div>
    </section>
  );
}

// -----------------------
// EditableText Component
// -----------------------
function EditableText({ section, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => setValue(text), [text]);

  const save = async () => {
    setLoading(true);
    const payload = { [section]: { [field]: value } };
    const res = await fetch(`/api/updateContent/products-and-partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      onTextUpdated(value);
      setEditing(false);
    } else {
      alert("Error: " + (json.error || res.statusText));
    }
  };

  return editing ? (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-grow text-2xl p-2 border rounded"
      />
      <button
        onClick={save}
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
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span onClick={() => setEditing(true)} className="cursor-pointer ml-1">
        ✏️
      </span>
    </span>
  );
}

// -----------------------
// PartnerEditableText Component
// -----------------------
function PartnerEditableText({ index, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => setValue(text), [text]);

  const save = async () => {
    setLoading(true);
    const payload = { partners: { [index]: { [field]: value } } };
    const res = await fetch(`/api/updateContent/products-and-partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      onTextUpdated(value);
      setEditing(false);
    } else {
      alert("Error: " + (json.error || res.statusText));
    }
  };

  return editing ? (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-grow text-2xl p-2 border rounded"
      />
      <button
        onClick={save}
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
    <span className="inline-flex items-center">
      <span>{text}</span>
      <span onClick={() => setEditing(true)} className="cursor-pointer ml-1">
        ✏️
      </span>
    </span>
  );
}
