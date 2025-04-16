"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import BannerImageUploadPopup from "@/components/admin/BannerImageUploadPopup";
import AboutUsImageUploadPopup from "@/components/admin/AboutUsImageUploadPopup";

export default function AdminAboutUs() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/getContent/about-us")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const handleTextUpdate = (section, field, newValue) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: newValue },
    }));
  };

  const updateAboutUsImage = (index, newImagePath) => {
    setData((prev) => {
      const imgs = [...prev.aboutUs.images];
      imgs[index] = newImagePath;
      return { ...prev, aboutUs: { ...prev.aboutUs, images: imgs } };
    });
  };

  // TeamInfo updaters
  const updateDirectorField = (key, newValue) => {
    setData((prev) => ({
      ...prev,
      teamInfo: {
        ...prev.teamInfo,
        director: { ...prev.teamInfo.director, [key]: newValue },
      },
    }));
  };
  const updateDirectorImage = (newImagePath) =>
    updateDirectorField("image", newImagePath);
  const updateTeamImage = (newImagePath) =>
    setData((prev) => ({
      ...prev,
      teamInfo: { ...prev.teamInfo, teamImage: newImagePath },
    }));

  if (!data)
    return (
      <div className="p-6 text-center text-white text-2xl">
        Loading all data. Please wait...
      </div>
    );

  return (
    <div className="admin-dashboard p-6 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold mb-8">About Us Editor</h1>

      <BannerSection
        banner={data.banner}
        updateText={handleTextUpdate}
        page="about-us"
      />

      <TeamInfoSection
        teamInfo={data.teamInfo}
        updateDirectorField={updateDirectorField}
        updateDirectorImage={updateDirectorImage}
        updateTeamImage={updateTeamImage}
      />

      <AboutUsSection
        aboutUs={data.aboutUs}
        updateText={handleTextUpdate}
        updateImage={updateAboutUsImage}
      />

      <MissionSection mission={data.ourMission} updateText={handleTextUpdate} />

      <VisionSection vision={data.ourVision} updateText={handleTextUpdate} />

      <CoreValuesSection
        coreValues={data.coreValues}
        updateText={handleTextUpdate}
      />

      <WhyChooseUsSection
        whyChooseUs={data.whyChooseUs}
        updateText={handleTextUpdate}
      />

      <CTASection CTA={data.cta} updateText={handleTextUpdate} />

      <SEOSection meta={data.meta} updateText={handleTextUpdate} />
    </div>
  );
}

// -----------------------
// Banner Section (unchanged)
// -----------------------
function BannerSection({ banner, updateText, page }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Banner Section</h2>
      <div className="mb-4">
        <Image
          src={banner.image}
          alt={banner.alt}
          width={300}
          height={150}
          objectFit="cover"
          className="rounded"
        />
      </div>
      <button
        onClick={() => setShowUploadPopup(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 text-2xl"
      >
        Upload New Image
      </button>
      <div className="text-2xl">
        <p className="font-medium">
          <EditableText
            section="banner"
            field="tagline"
            text={banner.tagline}
            onTextUpdated={(val) => updateText("banner", "tagline", val)}
          />
        </p>
        <p className="text-gray-600">
          <EditableText
            section="banner"
            field="sub"
            text={banner.sub}
            onTextUpdated={(val) => updateText("banner", "sub", val)}
          />
        </p>
      </div>
      {showUploadPopup && (
        <BannerImageUploadPopup
          page={page}
          banner={banner}
          onClose={() => setShowUploadPopup(false)}
          onUpdate={(newBanner) => {
            updateText("banner", "image", newBanner.image);
            updateText("banner", "alt", newBanner.alt);
            setShowUploadPopup(false);
          }}
        />
      )}
    </section>
  );
}

// -----------------------
// Team Info Section with upload states
// -----------------------
function TeamInfoSection({
  teamInfo,
  updateDirectorField,
  updateDirectorImage,
  updateTeamImage,
}) {
  const directorInput = useRef(null);
  const teamInput = useRef(null);
  const [directorUploading, setDirectorUploading] = useState(false);
  const [teamUploading, setTeamUploading] = useState(false);

  const upload = async (field, file) => {
    if (field === "director") setDirectorUploading(true);
    else setTeamUploading(true);

    const form = new FormData();
    form.append("field", field);
    form.append("file", file);

    const res = await fetch("/api/about-team", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) {
      alert("Error uploading image: " + (json.error || res.statusText));
    } else {
      if (field === "director") updateDirectorImage(json.imagePath);
      else updateTeamImage(json.imagePath);
    }

    if (field === "director") setDirectorUploading(false);
    else setTeamUploading(false);
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Team Info</h2>

      {/* Director */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Director</h3>
        <div className="mb-4">
          <EditableText
            section="teamInfo.director"
            field="name"
            text={teamInfo.director.name}
            onTextUpdated={(val) => updateDirectorField("name", val)}
          />
        </div>
        <div className="mb-4">
          <EditableText
            section="teamInfo.director"
            field="title"
            text={teamInfo.director.title}
            onTextUpdated={(val) => updateDirectorField("title", val)}
          />
        </div>
        <div className="flex items-center mb-4">
          <div className="w-48 h-48 relative mr-4">
            <Image
              src={teamInfo.director.image}
              alt="Director"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={directorInput}
            className="hidden"
            onChange={(e) => upload("director", e.target.files[0])}
          />
          <button
            onClick={() => directorInput.current.click()}
            disabled={directorUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded text-2xl disabled:opacity-50"
          >
            {directorUploading ? "Uploading..." : "Replace Director Image"}
          </button>
        </div>
      </div>

      {/* Team Image */}
      <div>
        <h3 className="text-2xl font-semibold mb-2">Team Image</h3>
        <div className="flex items-center mb-4">
          <div className="w-48 h-48 relative mr-4">
            <Image
              src={teamInfo.teamImage}
              alt="Team"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={teamInput}
            className="hidden"
            onChange={(e) => upload("teamImage", e.target.files[0])}
          />
          <button
            onClick={() => teamInput.current.click()}
            disabled={teamUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded text-2xl disabled:opacity-50"
          >
            {teamUploading ? "Uploading..." : "Replace Team Image"}
          </button>
        </div>
      </div>
    </section>
  );
}

// -----------------------
// About Us Section
// -----------------------
function AboutUsSection({ aboutUs, updateText, updateImage }) {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openUpdatePopup = (index) => {
    setSelectedIndex(index);
    setShowUploadPopup(true);
  };

  const handleImageUpdate = (uploadData) => {
    updateImage(selectedIndex, uploadData.imagePath);
    setShowUploadPopup(false);
    setSelectedIndex(null);
  };

  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="aboutUs"
          field="head"
          text={aboutUs.head}
          onTextUpdated={(val) => updateText("aboutUs", "head", val)}
        />
      </h2>

      <p className="mb-4 text-2xl">
        <EditableText
          section="aboutUs"
          field="text"
          text={aboutUs.text}
          onTextUpdated={(val) => updateText("aboutUs", "text", val)}
        />
      </p>

      <h3 className="text-2xl font-semibold mb-2">Images</h3>
      <AboutUsImagesTable
        images={aboutUs.images}
        onUpdateClick={openUpdatePopup}
      />

      {showUploadPopup && (
        <AboutUsImageUploadPopup
          page="about-us"
          section="aboutUs"
          index={selectedIndex}
          initialName=""
          onClose={() => {
            setShowUploadPopup(false);
            setSelectedIndex(null);
          }}
          onUpload={handleImageUpdate}
        />
      )}
    </section>
  );
}

function AboutUsImagesTable({ images, onUpdateClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-2xl border">Preview</th>
            <th className="p-2 text-2xl border">Name</th>
            <th className="p-2 text-2xl border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((src, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">
                <div className="inline-block relative w-80 h-48">
                  <Image
                    src={src}
                    alt={`Image ${idx + 1}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                  />
                </div>
              </td>
              <td className="p-2 border text-2xl">{`Image ${idx + 1}`}</td>
              <td className="p-2 text-2xl border">
                <button
                  onClick={() => onUpdateClick(idx)}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-2xl"
                >
                  Update Image
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------
// Mission Section
// -----------------------
function MissionSection({ mission, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="ourMission"
          field="head"
          text={mission.head}
          onTextUpdated={(val) => updateText("ourMission", "head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="ourMission"
          field="text"
          text={mission.text}
          onTextUpdated={(val) => updateText("ourMission", "text", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// Vision Section
// -----------------------
function VisionSection({ vision, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="ourVision"
          field="head"
          text={vision.head}
          onTextUpdated={(val) => updateText("ourVision", "head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="ourVision"
          field="text"
          text={vision.text}
          onTextUpdated={(val) => updateText("ourVision", "text", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// Core Values Section
// -----------------------
function CoreValuesSection({ coreValues, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="coreValues"
          field="head"
          text={coreValues.head}
          onTextUpdated={(val) => updateText("coreValues", "head", val)}
        />
      </h2>
      <p className="mb-4 text-2xl">
        <EditableText
          section="coreValues"
          field="text"
          text={coreValues.text}
          onTextUpdated={(val) => updateText("coreValues", "text", val)}
        />
      </p>
      <ul className="list-disc pl-8">
        {coreValues.values.map((value, idx) => (
          <li key={idx} className="text-2xl">
            {value}
          </li>
        ))}
      </ul>
    </section>
  );
}

// -----------------------
// Why Choose Us Section
// -----------------------
function WhyChooseUsSection({ whyChooseUs, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="whyChooseUs"
          field="head"
          text={whyChooseUs.head}
          onTextUpdated={(val) => updateText("whyChooseUs", "head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="whyChooseUs"
          field="text"
          text={whyChooseUs.text}
          onTextUpdated={(val) => updateText("whyChooseUs", "text", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// CTA Section
// -----------------------
function CTASection({ CTA, updateText }) {
  return (
    <section className="mb-8 p-6 bg-blue-100 rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">
        <EditableText
          section="cta"
          field="head"
          text={CTA.head}
          onTextUpdated={(val) => updateText("cta", "head", val)}
        />
      </h2>
      <p className="text-2xl">
        <EditableText
          section="cta"
          field="tagline"
          text={CTA.tagline}
          onTextUpdated={(val) => updateText("cta", "tagline", val)}
        />
      </p>
      <p className="text-2xl">
        <EditableText
          section="cta"
          field="text"
          text={CTA.text}
          onTextUpdated={(val) => updateText("cta", "text", val)}
        />
      </p>
    </section>
  );
}

// -----------------------
// SEO Section
// -----------------------
function SEOSection({ meta, updateText }) {
  return (
    <section className="mb-8 p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">SEO Settings</h2>
      <div className="mb-4 text-2xl">
        <p>
          <span className="font-medium">Title: </span>
          <EditableText
            section="meta"
            field="title"
            text={meta.title}
            onTextUpdated={(val) => updateText("meta", "title", val)}
          />
        </p>
        <p>
          <span className="font-medium">Description: </span>
          <EditableText
            section="meta"
            field="description"
            text={meta.description}
            onTextUpdated={(val) => updateText("meta", "description", val)}
          />
        </p>
        <p>
          <span className="font-medium">Keywords: </span>
          <EditableText
            section="meta"
            field="keywords"
            text={meta.keywords}
            onTextUpdated={(val) => updateText("meta", "keywords", val)}
          />
        </p>
      </div>
    </section>
  );
}

// -----------------------
// Editable Text Component
// -----------------------
function EditableText({ section, field, text, onTextUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(text);
  }, [text]);

  const saveChanges = async () => {
    setLoading(true);
    const payload = { [section]: { [field]: value } };

    try {
      const res = await fetch(`/api/updateContent/about-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onTextUpdated(value);
        setEditing(false);
      } else {
        alert("Error saving changes: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving changes: " + err.message);
    }
    setLoading(false);
  };

  const cancelEditing = () => {
    setValue(text);
    setEditing(false);
  };

  return (
    <span className="w-full inline-flex items-center">
      {editing ? (
        <>
          <input
            type="text"
            className="flex-grow text-2xl p-2 border border-gray-300 rounded"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={saveChanges}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded text-2xl"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={cancelEditing}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded text-2xl"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-2xl">{text}</span>
          <span
            onClick={() => setEditing(true)}
            className="cursor-pointer text-2xl ml-1 inline"
          >
            ✏️
          </span>
        </>
      )}
    </span>
  );
}
