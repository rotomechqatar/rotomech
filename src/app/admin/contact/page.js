"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import ContactImageUploadPopup from "@/components/admin/ContactImageUploadPopup";

export default function AdminContactUs() {
  const [data, setData] = useState(null);

  // Fetch contact us content data on mount
  useEffect(() => {
    fetch("/api/getContent/contact-us")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  // Handler to update a specific text field in state
  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  // Handler for top-level fields (not nested inside an object)
  const handleFieldUpdate = (field, newValue) => {
    setData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  // Handler to update an image in the images array
  const updateContactImage = (index, newImagePath) => {
    setData((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = newImagePath;
      return { ...prev, images: updatedImages };
    });
  };

  if (!data) return <div className="p-6 text-center text-2xl">Loading...</div>;

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">
        Admin Dashboard - Contact Us Editor
      </h1>

      <BannerSection
        banner={data.banner}
        updateText={handleTextUpdate}
        page="contact-us"
      />

      <ContactInfoSection
        head={data.head}
        text={data.text}
        updateField={handleFieldUpdate}
      />

      <CTASection cta={data.cta} updateText={handleTextUpdate} />

      <LocationSection
        location={data.location}
        updateField={handleFieldUpdate}
      />

      <ContactImagesSection
        images={data.images}
        updateImage={updateContactImage}
      />
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
// Contact Info Section
// -----------------------
function ContactInfoSection({ head, text, updateField }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="contact"
          field="head"
          text={head}
          onTextUpdated={(val) => updateField("head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="contact"
          field="text"
          text={text}
          onTextUpdated={(val) => updateField("text", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// CTA Section
// -----------------------
function CTASection({ cta, updateText }) {
  return (
    <section className="mb-8 p-6 bg-blue-100 rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">CTA Section</h2>
      <p className="text-2xl">
        <EditableText
          section="cta"
          field="text"
          text={cta.text}
          onTextUpdated={(val) => updateText("cta", "text", val)}
        />
      </p>
      <div className="mt-4 text-2xl">
        <p>
          <strong>Tel:</strong>{" "}
          <EditableText
            section="cta"
            field="tel"
            text={cta.tel}
            onTextUpdated={(val) => updateText("cta", "tel", val)}
          />
        </p>
        <p>
          <strong>Mobile:</strong>{" "}
          <EditableText
            section="cta"
            field="mobile"
            text={cta.mobile}
            onTextUpdated={(val) => updateText("cta", "mobile", val)}
          />
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <EditableText
            section="cta"
            field="email"
            text={cta.email}
            onTextUpdated={(val) => updateText("cta", "email", val)}
          />
        </p>
      </div>
    </section>
  );
}

// -----------------------
// Location Section (Updated)
// -----------------------
function LocationSection({ location, updateField }) {
  // Extract URL string if location is an object.
  const locationUrl =
    typeof location === "object" && location !== null
      ? location.url || ""
      : location;
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Location</h2>
      <p className="text-2xl">
        <EditableLocationText
          section="location"
          field="url"
          text={location}
          onTextUpdated={(val) => updateField("location", { url: val })}
        />
      </p>
      <div className="mt-4">
        <iframe
          src={locationUrl}
          width="100%"
          height="400"
          loading="lazy"
          className="rounded"
        ></iframe>
      </div>
    </section>
  );
}

// -----------------------
// Contact Images Section
// -----------------------
function ContactImagesSection({ images, updateImage }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openUpdatePopup = (index) => {
    setSelectedIndex(index);
    setShowUploadPopup(true);
  };

  const handleImageUpdate = (uploadData) => {
    updateImage(selectedIndex, uploadData.imagePath);
    setShowUploadPopup(false);
    setSelectedIndex(null);
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Images</h2>
      <ContactImagesTable images={images} onUpdateClick={openUpdatePopup} />
      {showUploadPopup && (
        <ContactImageUploadPopup
          page="contact-us"
          section="contact"
          index={selectedIndex}
          initialName=""
          onClose={() => {
            setShowUploadPopup(false);
            setSelectedIndex(null);
          }}
          onUpload={handleImageUpdate}
        />
      )}
    </section>
  );
}

function ContactImagesTable({ images, onUpdateClick }) {
  const imageRows = images.map((src, index) => ({
    index,
    src,
    name: `Image ${index + 1}`,
  }));

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
          {imageRows.map((img) => (
            <tr key={img.index} className="text-center">
              <td className="p-2 border">
                <div className="inline-block relative w-80 h-48">
                  <Image
                    src={img.src}
                    alt={`Image ${img.index + 1}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                  />
                </div>
              </td>
              <td className="p-2 border text-2xl">{img.name}</td>
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
      const res = await fetch(`/api/updateContent/contact-us`, {
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
// Editable Location Text Component
// -----------------------
function EditableLocationText({ section, field, text, onTextUpdated }) {
  // If text is an object (e.g. { url: "..." }), use its url; otherwise, use text.
  const initialValue =
    typeof text === "object" && text !== null ? text.url || "" : text;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newValue =
      typeof text === "object" && text !== null ? text.url || "" : text;
    setValue(newValue);
  }, [text]);

  const isValidGoogleMapsEmbed = (url) =>
    url.startsWith("https://www.google.com/maps/embed?");

  const saveChanges = async () => {
    if (!isValidGoogleMapsEmbed(value)) {
      alert("Please input a valid Google Maps embed link.");
      return;
    }
    setLoading(true);
    const payload = { [section]: { [field]: value } };

    try {
      const res = await fetch(`/api/updateContent/contact-us`, {
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
    const newValue =
      typeof text === "object" && text !== null ? text.url || "" : text;
    setValue(newValue);
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
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded text-2xl transition-all duration-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={cancelEditing}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded text-2xl transition-all duration-300"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-2xl">
            {value.length > 80 ? value.substring(0, 80) + "..." : value}
          </span>
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
