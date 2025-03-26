"use client";
import React from "react";
import EditableText from "@/components/admin/EditableText";

const HomepageDirectorMessage = ({ directorMessage, onEditField }) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Message from Our Director</h2>
      <EditableText
        section="directorMessage"
        field="start"
        label="Start"
        value={directorMessage.start}
        onEdit={onEditField}
      />
      <EditableText
        section="directorMessage"
        field="head"
        label="Head"
        value={directorMessage.head}
        onEdit={onEditField}
      />
      <EditableText
        section="directorMessage"
        field="quote"
        label="Quote"
        value={directorMessage.quote}
        onEdit={onEditField}
      />
      <EditableText
        section="directorMessage"
        field="author"
        label="Author"
        value={directorMessage.author}
        onEdit={onEditField}
      />
    </section>
  );
};

export default HomepageDirectorMessage;
