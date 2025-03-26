"use client";
import React, { useState, useEffect } from "react";
import EditIcon from "./EditIcon";

const EditableText = ({ section, field, label, value, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
    setEditing(false);
  }, [value]);

  const startEditing = () => {
    setTempValue(value);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = () => {
    onEdit(section, field, tempValue);
    setEditing(false);
  };

  return (
    <div className="text-2xl my-2">
      <strong>{label}:</strong>{" "}
      {editing ? (
        <>
          {value.length > 100 ? (
            <textarea
              className="w-full text-2xl border p-2"
              rows={5}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
          ) : (
            <input
              type="text"
              className="w-full text-2xl border p-2"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
          )}
          <button
            onClick={handleSave}
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={cancelEditing}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span>{value}</span>
          <EditIcon onClick={startEditing} />
        </>
      )}
    </div>
  );
};

export default EditableText;
