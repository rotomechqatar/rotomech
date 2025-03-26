"use client";
import React from "react";
import EditableText from "@/components/admin/EditableText";
import BannerImageUploader from "./BannerImageUploader";

const HomepageBanner = ({ banner, onEditField, onBannerImageUpload }) => {
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
      <BannerImageUploader
        src={banner.image}
        alt={banner.alt}
        onUpload={onBannerImageUpload}
      />
    </section>
  );
};

export default HomepageBanner;
