"use client";
import React from "react";
import EditableText from "@/components/admin/EditableText";
import EditableImageRow from "@/components/admin/EditableImageRow";

const HomepageOurLegacy = ({
  ourLegacy,
  legacyImages,
  onEditField,
  onEditImage,
  onDeleteImage,
  onAddImage,
}) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Our Legacy</h2>
      <EditableText
        section="ourLegacy"
        field="head"
        label="Head"
        value={ourLegacy.head}
        onEdit={onEditField}
      />
      <EditableText
        section="ourLegacy"
        field="text"
        label="Text"
        value={ourLegacy.text}
        onEdit={onEditField}
      />
      <h3 className="text-3xl font-semibold mt-4 mb-2">Legacy Images</h3>
      <table className="min-w-full border text-2xl">
        <thead>
          <tr className="border-b">
            <th className="p-4">Preview</th>
            <th className="p-4">Filename</th>
            <th className="p-4">Alt Text</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {legacyImages.map((img) => (
            <EditableImageRow
              key={img.key}
              section="ourLegacy"
              imageKey={img.key}
              src={img.src}
              alt={img.alt}
              onEdit={onEditImage}
              onDelete={onDeleteImage}
            />
          ))}
          <tr>
            <td colSpan="4" className="p-4 text-center">
              <button
                onClick={() => onAddImage("ourLegacy")}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Image
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default HomepageOurLegacy;
