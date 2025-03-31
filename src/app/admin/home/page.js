"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import UniversalImageUploadPopup from "@/components/admin/UniversalImageUploadPopup";
import AddPartnerPopup from "@/components/admin/AddPartnerPopup";

export default function AdminHomepage() {
  const [data, setData] = useState(null);

  // Fetch homepage content data on mount
  useEffect(() => {
    fetch("/api/getContent/homepage")
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

  // Handler to update the entire ourLegacy section
  const updateLegacySection = (update) => {
    setData((prev) => ({
      ...prev,
      ourLegacy: typeof update === "function" ? update(prev.ourLegacy) : update,
    }));
  };

  // Handler to update partnerLogos after adding a new partner
  const updatePartnerLogos = (newPartner) => {
    setData((prev) => ({
      ...prev,
      partnerLogos: {
        ...prev.partnerLogos,
        [`logo${newPartner.index}`]: newPartner.imagePath,
      },
    }));
  };

  // New handler to remove a partner from state (after successful deletion)
  const removePartnerLogo = (partnerKey) => {
    setData((prev) => {
      const newPartnerLogos = { ...prev.partnerLogos };
      delete newPartnerLogos[partnerKey];
      return { ...prev, partnerLogos: newPartnerLogos };
    });
  };

  if (!data) return <div className="p-6 text-center text-2xl">Loading...</div>;

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">
        Admin Dashboard - Homepage Editor
      </h1>

      <BannerSection banner={data.banner} updateText={handleTextUpdate} />
      <OurLegacySection
        ourLegacy={data.ourLegacy}
        updateText={handleTextUpdate}
        updateLegacySection={updateLegacySection}
      />
      <DirectorMessageSection
        directorMessage={data.directorMessage}
        updateText={handleTextUpdate}
      />
      <CTASection CTA={data.CTA} updateText={handleTextUpdate} />
      <PartnerLogosSection
        partnerLogos={data.partnerLogos}
        updatePartnerLogos={updatePartnerLogos}
        removePartnerLogo={removePartnerLogo}
      />
      <ClientLogosSection clientLogos={data.clientLogos} />
    </div>
  );
}

// -----------------------
// Partner & Client Logos
// -----------------------

function PartnerLogosSection({
  partnerLogos,
  updatePartnerLogos,
  removePartnerLogo,
}) {
  const logos = Object.entries(partnerLogos).map(([key, src]) => ({
    name: key, // partner key such as "logo1", "logo2", etc.
    src,
    alt: `Partner logo ${key}`,
  }));

  const [showAddPartnerPopup, setShowAddPartnerPopup] = useState(false);

  // Delete handler for a partner logo
  const handleDeletePartner = async (partnerKey) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    try {
      const res = await fetch("/api/partner/deletePartner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: partnerKey }),
      });
      const data = await res.json();
      if (res.ok) {
        removePartnerLogo(partnerKey);
      } else {
        alert("Error deleting partner: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting partner: " + err.message);
    }
  };

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
      <ImageTable images={logos} onDelete={handleDeletePartner} />
      {showAddPartnerPopup && (
        <AddPartnerPopup
          onClose={() => setShowAddPartnerPopup(false)}
          onUpdate={(res) => {
            updatePartnerLogos(res);
            setShowAddPartnerPopup(false);
          }}
        />
      )}
    </section>
  );
}

function ClientLogosSection({ clientLogos }) {
  const logos = Object.entries(clientLogos).map(([key, src]) => ({
    name: key,
    src,
    alt: `Client logo ${key}`,
  }));

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">Our Clients</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded text-2xl">
          Add Client
        </button>
      </div>
      <ImageTable images={logos} />
    </section>
  );
}

// Updated ImageTable component accepts an optional onDelete prop.
// If onDelete is provided, the Delete button will call onDelete with the image name (partner key).
function ImageTable({ images, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-2xl border">Preview</th>
            <th className="p-2 text-2xl border">Name</th>
            <th className="p-2 text-2xl border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">
                <div className="inline-block relative w-80 h-48">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                  />
                </div>
              </td>
              <td className="p-2 border text-2xl">{img.name}</td>
              <td className="p-2 text-2xl border">
                {onDelete ? (
                  <button
                    onClick={() => onDelete(img.name)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-2xl"
                  >
                    Delete
                  </button>
                ) : (
                  <button className="px-2 py-1 bg-red-500 text-white rounded text-2xl">
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------
// Other Sections (unchanged)
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
          page="homepage"
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

function OurLegacySection({ ourLegacy, updateText, updateLegacySection }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Build an array of legacy images (keys: image1, alt1, name1, etc.)
  const legacyImages = [];
  for (let i = 1; i <= 10; i++) {
    if (ourLegacy[`image${i}`]) {
      legacyImages.push({
        index: i,
        name: ourLegacy[`name${i}`] || `Image ${i}`,
        src: ourLegacy[`image${i}`],
        alt: ourLegacy[`alt${i}`] || `Legacy image ${i}`,
      });
    }
  }

  const openUpdatePopup = (index) => {
    setSelectedIndex(index);
    setShowUploadPopup(true);
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">{ourLegacy.head}</h2>
      </div>
      <p className="mb-4 text-2xl">
        <EditableText
          section="ourLegacy"
          field="text"
          text={ourLegacy.text}
          onTextUpdated={(val) => updateText("ourLegacy", "text", val)}
        />
      </p>
      {legacyImages.length > 0 ? (
        <LegacyImageTable
          images={legacyImages}
          section="ourLegacy"
          onUpdateClick={openUpdatePopup}
          updateLegacySection={updateLegacySection}
        />
      ) : (
        <p className="text-2xl">No legacy images found.</p>
      )}
      {showUploadPopup && (
        <UniversalImageUploadPopup
          page="homepage"
          section="ourLegacy"
          index={selectedIndex}
          initialName={ourLegacy[`name${selectedIndex}`] || ""}
          initialAlt={ourLegacy[`alt${selectedIndex}`] || ""}
          onClose={() => {
            setShowUploadPopup(false);
            setSelectedIndex(null);
          }}
          onUpload={(uploadData) => {
            updateLegacySection((prev) => ({
              ...prev,
              [`image${selectedIndex}`]: uploadData.imagePath,
              [`alt${selectedIndex}`]: uploadData.alt,
              [`name${selectedIndex}`]:
                uploadData.name || prev[`name${selectedIndex}`],
            }));
          }}
        />
      )}
    </section>
  );
}

function LegacyImageTable({ images, section, onUpdateClick }) {
  const updateLegacyAlt = (index, newAlt) => {
    // This function can be used to update alt text inline.
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-2xl border">Preview</th>
            <th className="p-2 text-2xl border">Name</th>
            <th className="p-2 text-2xl border">Alt Text</th>
            <th className="p-2 text-2xl border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr key={img.index} className="text-center">
              <td className="p-2 border">
                <div className="inline-block relative w-80 h-48">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                  />
                </div>
              </td>
              <td className="p-2 border text-2xl">{img.name}</td>
              <td className="p-2 border text-2xl">
                <EditableText
                  section="ourLegacy"
                  field={`alt${img.index}`}
                  text={img.alt}
                  onTextUpdated={(val) => updateLegacyAlt(img.index, val)}
                />
              </td>
              <td className="p-2 text-2xl border">
                <button
                  onClick={() => onUpdateClick(img.index)}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-2xl"
                >
                  Update Image
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DirectorMessageSection({ directorMessage, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-2">Director Message</h2>
      <h3 className="text-2xl mb-4">
        <EditableText
          section="directorMessage"
          field="head"
          text={directorMessage.head}
          onTextUpdated={(val) => updateText("directorMessage", "head", val)}
        />
      </h3>
      <blockquote className="italic border-l-4 border-blue-500 pl-4 mb-2 text-2xl">
        <EditableText
          section="directorMessage"
          field="quote"
          text={directorMessage.quote}
          onTextUpdated={(val) => updateText("directorMessage", "quote", val)}
        />
      </blockquote>
      <p className="font-bold text-2xl">
        <EditableText
          section="directorMessage"
          field="author"
          text={directorMessage.author}
          onTextUpdated={(val) => updateText("directorMessage", "author", val)}
        />
      </p>
    </section>
  );
}

function CTASection({ CTA, updateText }) {
  return (
    <section className="mb-8 p-6 bg-blue-100 rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="CTA"
          field="head"
          text={CTA.head}
          onTextUpdated={(val) => updateText("CTA", "head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="CTA"
          field="text"
          text={CTA.text}
          onTextUpdated={(val) => updateText("CTA", "text", val)}
        />
      </p>
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
      const res = await fetch(`/api/updateContent/homepage`, {
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
