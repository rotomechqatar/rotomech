"use client";
import React, { useState } from "react";

const BannerImageEditor = ({ src, alt, onReplace, onDelete, onAltChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1];
      await onReplace(base64Data);
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
        <button
          onClick={() => onAltChange(prompt("Enter new alt text:", alt) || alt)}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded text-2xl"
        >
          Edit Alt
        </button>
      </div>
      <div className="mt-2">
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded text-2xl"
        >
          Delete Image
        </button>
        <label className="ml-4 bg-green-500 text-white px-4 py-2 rounded text-2xl cursor-pointer">
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

export default BannerImageEditor;
