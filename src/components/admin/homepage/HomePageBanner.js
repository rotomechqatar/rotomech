"use client";
import React from "react";
import EditableText from "@/components/admin/EditableText";
import BannerImageEditor from "./BannerImageEditor";

const HomepageBanner = ({
  banner,
  onEditField,
  onReplaceImage,
  onDeleteImage,
}) => {
  return (
    <section className="border p-4 rounded">
      <h2 className="text-3xl font-semibold mb-2">Banner</h2>
      <EditableText
        section="banner"
        field="tagline"
        label="Tagline"
        value={banner.tagline}
        onEdit={onEditField}
      />
      <EditableText
        section="banner"
        field="sub"
        label="Sub"
        value={banner.sub}
        onEdit={onEditField}
      />
      <BannerImageEditor
        src={banner.image}
        alt={banner.alt}
        onReplace={onReplaceImage}
        onDelete={() => onDeleteImage("banner", "image")}
        onAltChange={() =>
          onEditField(
            "banner",
            "alt",
            prompt("Enter new alt text:", banner.alt) || banner.alt
          )
        }
      />
    </section>
  );
};

export default HomepageBanner;
