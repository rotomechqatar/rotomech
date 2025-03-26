"use client";
import React from "react";
import EditableImageRow from "@/components/admin/EditableImageRow";

const HomepageClientLogos = ({
  clientLogos,
  onEditImage,
  onDeleteImage,
  onAddLogo,
}) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Client Logos</h2>
      <table className="min-w-full border text-2xl">
        <thead>
          <tr className="border-b">
            <th className="p-4">Preview</th>
            <th className="p-4">Filename</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clientLogos.map((logo) => (
            <EditableImageRow
              key={logo.key}
              section="clientLogos"
              imageKey={logo.key}
              src={logo.src}
              alt={""} // client logos do not have alt text
              onEdit={onEditImage}
              onDelete={onDeleteImage}
            />
          ))}
          <tr>
            <td colSpan="3" className="p-4 text-center">
              <button
                onClick={() => onAddLogo("clientLogos")}
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

export default HomepageClientLogos;
