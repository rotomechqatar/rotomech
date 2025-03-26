"use client";
import React, { useState } from "react";

const BannerImageUploader = ({ src, alt, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Prompt the user for a new filename (optional) and alt text
    const providedFilename = prompt("Enter new filename (optional):", "");
    const providedAlt = prompt("Enter alt text (optional):", alt) || alt;

    // Read file as Base64 (without data URI prefix)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1];
      setUploading(true);
      await onUpload(base64Data, providedFilename, providedAlt);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="my-4">
      <img src={src} alt={alt} className="max-w-[30rem] h-[20rem]" />
      <div className="mt-2 text-2xl">
        <span>
          <strong>Alt Text:</strong> {alt}
        </span>
      </div>
      <div className="mt-2">
        <label className="bg-green-500 text-white px-4 py-2 rounded text-2xl cursor-pointer">
          {uploading ? "Uploading..." : "Upload New Image"}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default BannerImageUploader;
