"use client";
import React, { useState, useEffect } from "react";
import HomepageBanner from "@/components/admin/homepage/HomepageBanner";
import HomepageOurLegacy from "@/components/admin/homepage/HomepageOurLegacy";
import HomepageDirectorMessage from "@/components/admin/homepage/HomepageDirectorMessage";
import HomepageCTA from "@/components/admin/homepage/HomepageCTA";
import HomepagePartnerLogos from "@/components/admin/homepage/HomepagePartnerLogos";
import HomepageClientLogos from "@/components/admin/homepage/HomepageClientLogos";
import SuccessIcon from "@/components/admin/SuccessIcon";
import ErrorIcon from "@/components/admin/ErrorIcon";

export default function HomeAdminPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Automatically clear notification after 3 seconds.
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch homepage content from the API
  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("/api/getContent/homepage", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch homepage content");
        const data = await res.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading)
    return <div className="text-4xl">Loading homepage content...</div>;
  if (error) return <div className="text-4xl text-red-600">Error: {error}</div>;

  // Handler to update content for a text field
  const handleFieldUpdate = async (section, field, newValue) => {
    setSaving(true);
    try {
      const updatePayload = { [section]: { [field]: newValue } };
      const res = await fetch("/api/updateContent/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) throw new Error("Failed to update content");
      const result = await res.json();
      setContent(result.content);
      setNotification({ status: "success", message: "Saved successfully!" });
    } catch (err) {
      setNotification({ status: "error", message: err.message });
      alert(`Error saving changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handler for editing image details (only updating alt text)
  const handleImageEdit = async (section, imageKey, newFilename, newAlt) => {
    try {
      const payload = { section, key: imageKey, newAlt };
      const res = await fetch("/api/editImage/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update image details");
      const result = await res.json();
      setContent(result.content);
      setNotification({
        status: "success",
        message: "Image details updated successfully!",
      });
    } catch (err) {
      setNotification({ status: "error", message: err.message });
      alert(`Error updating image details: ${err.message}`);
    }
  };

  // Handler for replacing the banner image
  const handleBannerImageReplace = async (fileData) => {
    try {
      const payload = {
        section: "banner",
        key: "image",
        newAlt: content.banner.alt,
        fileData,
      };
      const res = await fetch("/api/replaceImage/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to replace banner image");
      const result = await res.json();
      setContent(result.content);
      setNotification({
        status: "success",
        message: "Banner image replaced successfully!",
      });
    } catch (err) {
      setNotification({ status: "error", message: err.message });
      alert(`Error replacing banner image: ${err.message}`);
    }
  };

  // Dummy handlers for delete and add operations
  const handleDelete = (section, key) => {
    alert(`Delete ${section} item: ${key}`);
  };

  const handleAdd = (section) => {
    alert(`Add new item to ${section}`);
  };

  // Utility function to transform ourLegacy images into an array
  function transformLegacyImages(legacy) {
    const images = [];
    for (const key in legacy) {
      if (key.startsWith("image")) {
        const index = key.substring("image".length);
        const altKey = `alt${index}`;
        images.push({ key, src: legacy[key], alt: legacy[altKey] || "" });
      }
    }
    return images;
  }

  const legacyImages = content.ourLegacy
    ? transformLegacyImages(content.ourLegacy)
    : [];
  const partnerLogos = content.partnerLogos
    ? Object.entries(content.partnerLogos).map(([key, src]) => ({ key, src }))
    : [];
  const clientLogos = content.clientLogos
    ? Object.entries(content.clientLogos).map(([key, src]) => ({ key, src }))
    : [];

  return (
    <div className="w-4/5 mx-auto p-8 space-y-8">
      {notification && (
        <div className="text-2xl mb-4 p-4 border rounded flex items-center">
          {notification.status === "success" ? <SuccessIcon /> : <ErrorIcon />}
          <span>{notification.message}</span>
        </div>
      )}
      <h1 className="text-5xl font-bold mb-8">Edit Homepage Content</h1>

      <HomepageBanner
        banner={content.banner}
        onEditField={handleFieldUpdate}
        onReplaceImage={handleBannerImageReplace}
        onDeleteImage={handleDelete}
      />

      {content.ourLegacy && (
        <HomepageOurLegacy
          ourLegacy={content.ourLegacy}
          legacyImages={legacyImages}
          onEditField={handleFieldUpdate}
          onEditImage={handleImageEdit}
          onDeleteImage={handleDelete}
          onAddImage={handleAdd}
        />
      )}

      {content.directorMessage && (
        <HomepageDirectorMessage
          directorMessage={content.directorMessage}
          onEditField={handleFieldUpdate}
        />
      )}

      {content.CTA && (
        <HomepageCTA CTA={content.CTA} onEditField={handleFieldUpdate} />
      )}

      {content.partnerLogos && (
        <HomepagePartnerLogos
          partnerLogos={partnerLogos}
          onEditImage={handleImageEdit}
          onDeleteImage={handleDelete}
          onAddLogo={handleAdd}
        />
      )}

      {content.clientLogos && (
        <HomepageClientLogos
          clientLogos={clientLogos}
          onEditImage={handleImageEdit}
          onDeleteImage={handleDelete}
          onAddLogo={handleAdd}
        />
      )}
    </div>
  );
}
