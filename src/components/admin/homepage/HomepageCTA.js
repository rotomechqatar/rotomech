"use client";
import React from "react";
import EditableText from "@/components/admin/EditableText";

const HomepageCTA = ({ CTA, onEditField }) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Call To Action</h2>
      <EditableText
        section="CTA"
        field="head"
        label="Head"
        value={CTA.head}
        onEdit={onEditField}
      />
      <EditableText
        section="CTA"
        field="text"
        label="Text"
        value={CTA.text}
        onEdit={onEditField}
      />
    </section>
  );
};

export default HomepageCTA;
