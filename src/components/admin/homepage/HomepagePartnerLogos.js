"use client";
import React from "react";
import EditableImageRow from "@/components/admin/EditableImageRow";

const HomepagePartnerLogos = ({
  partnerLogos,
  onEditImage,
  onDeleteImage,
  onAddLogo,
}) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Partner Logos</h2>
      <table className="min-w-full border text-2xl">
        <thead>
          <tr className="border-b">
            <th className="p-4">Preview</th>
            <th className="p-4">Filename</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {partnerLogos.map((logo) => (
            <EditableImageRow
              key={logo.key}
              section="partnerLogos"
              imageKey={logo.key}
              src={logo.src}
              alt={""} // partner logos do not have alt text
              onEdit={onEditImage}
              onDelete={onDeleteImage}
            />
          ))}
          <tr>
            <td colSpan="3" className="p-4 text-center">
              <button
                onClick={() => onAddLogo("partnerLogos")}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Logo
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default HomepagePartnerLogos;
