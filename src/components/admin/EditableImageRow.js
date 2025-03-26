"use client";
import React, { useState, useEffect } from "react";
import EditIcon from "./EditIcon";

const EditableImageRow = ({
  section,
  imageKey,
  src,
  alt,
  onEdit,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [newAlt, setNewAlt] = useState(alt || "");

  useEffect(() => {
    setNewAlt(alt || "");
  }, [alt]);

  const startEditing = () => {
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  // Only update the alt text (as per requirements, no renaming for images)
  const handleSave = () => {
    onEdit(section, imageKey, null, newAlt);
    setEditing(false);
  };

  return (
    <tr className="border-b">
      <td className="p-4">
        <img src={src} alt={alt} className="h-40" />
      </td>
      <td className="p-4">
        <span>{src.split("/").pop()}</span>
      </td>
      <td className="p-4">
        {editing ? (
          <input
            type="text"
            className="w-full text-2xl border p-2"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
          />
        ) : (
          <span>{alt}</span>
        )}
      </td>
      <td className="p-4 space-x-4">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded text-2xl"
            >
              Save
            </button>
            <button
              onClick={cancelEditing}
              className="bg-gray-500 text-white px-4 py-2 rounded text-2xl"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startEditing}
              className="bg-blue-500 text-white px-4 py-2 rounded text-2xl"
            >
              Edit Alt
            </button>
            <button
              onClick={() => onDelete(section, imageKey)}
              className="bg-red-500 text-white px-4 py-2 rounded text-2xl"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default EditableImageRow;
