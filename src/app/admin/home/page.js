"use client";
import { useState, useEffect } from "react";

// A simple inline pencil icon for editing text fields
const EditIcon = ({ onClick }) => (
  <button onClick={onClick} className="ml-2 inline-block cursor-pointer">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7 21H3v-4L16.732 3.732z"
      />
    </svg>
  </button>
);

export default function HomeAdminPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch homepage content from the API
  useEffect(() => {
    async function fetchContent() {
      console.log("Fetching homepage content from /api/getContent/homepage");
      try {
        const res = await fetch("/api/getContent/homepage", {
          credentials: "include",
        });
        console.log("Fetch response status:", res.status);
        if (!res.ok) {
          throw new Error("Failed to fetch homepage content");
        }
        const data = await res.json();
        console.log("Received homepage data:", data);
        setContent(data);
      } catch (err) {
        console.error("Error fetching homepage content:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading)
    return <div className="text-4xl">Loading homepage content...</div>;
  if (error) return <div className="text-4xl text-red-600">Error: {error}</div>;

  // Utility function to transform ourLegacy images into an array
  function transformLegacyImages(legacy) {
    const images = [];
    for (const key in legacy) {
      if (key.startsWith("image")) {
        const index = key.substring("image".length); // e.g., "1"
        const altKey = `alt${index}`;
        images.push({
          key,
          src: legacy[key],
          alt: legacy[altKey] || "",
        });
      }
    }
    return images;
  }

  // Transform dynamic lists for ourLegacy, partnerLogos, and clientLogos
  const legacyImages = content.ourLegacy
    ? transformLegacyImages(content.ourLegacy)
    : [];
  const partnerLogos = content.partnerLogos
    ? Object.entries(content.partnerLogos).map(([key, src]) => ({ key, src }))
    : [];
  const clientLogos = content.clientLogos
    ? Object.entries(content.clientLogos).map(([key, src]) => ({ key, src }))
    : [];

  // Dummy event handlers for edit, delete, add actions
  const handleEdit = (section, field) => {
    alert(`Edit ${section} field: ${field}`);
  };

  const handleDelete = (section, key) => {
    alert(`Delete ${section} item: ${key}`);
  };

  const handleAdd = (section) => {
    alert(`Add new item to ${section}`);
  };

  return (
    <div className="w-4/5 mx-auto p-8 space-y-8">
      <h1 className="text-5xl font-bold mb-8">Edit Homepage Content</h1>

      {/* Banner Section */}
      {content.banner && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Banner</h2>
          <p className="text-2xl">
            <strong>Tagline:</strong> {content.banner.tagline}
            <EditIcon onClick={() => handleEdit("banner", "tagline")} />
          </p>
          <p className="text-2xl">
            <strong>Sub:</strong> {content.banner.sub}
            <EditIcon onClick={() => handleEdit("banner", "sub")} />
          </p>
          <div className="mt-2">
            <img
              src={content.banner.image}
              alt={content.banner.alt}
              className="max-w-[30rem] h-[20rem]"
            />
          </div>
        </section>
      )}

      {/* Our Legacy Section */}
      {content.ourLegacy && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Our Legacy</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.ourLegacy.head}
            <EditIcon onClick={() => handleEdit("ourLegacy", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.ourLegacy.text}
            <EditIcon onClick={() => handleEdit("ourLegacy", "text")} />
          </p>
          <h3 className="text-3xl font-semibold mt-4 mb-2">Legacy Images</h3>
          <table className="min-w-full border text-2xl">
            <thead>
              <tr className="border-b">
                <th className="p-4">Preview</th>
                <th className="p-4">Key</th>
                <th className="p-4">Alt Text</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {legacyImages.map((img) => (
                <tr key={img.key} className="border-b">
                  <td className="p-4">
                    <img src={img.src} alt={img.alt} className="h-40" />
                  </td>
                  <td className="p-4">{img.key}</td>
                  <td className="p-4">{img.alt}</td>
                  <td className="p-4 space-x-4">
                    <button
                      onClick={() => handleEdit("ourLegacy", img.key)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("ourLegacy", img.key)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  <button
                    onClick={() => handleAdd("ourLegacy")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Add Image
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Director Message Section */}
      {content.directorMessage && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">
            Message from Our Director
          </h2>
          <p className="text-2xl">
            <strong>Start:</strong> {content.directorMessage.start}
            <EditIcon onClick={() => handleEdit("directorMessage", "start")} />
          </p>
          <p className="text-2xl">
            <strong>Head:</strong> {content.directorMessage.head}
            <EditIcon onClick={() => handleEdit("directorMessage", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Quote:</strong> {content.directorMessage.quote}
            <EditIcon onClick={() => handleEdit("directorMessage", "quote")} />
          </p>
          <p className="text-2xl">
            <strong>Author:</strong> {content.directorMessage.author}
            <EditIcon onClick={() => handleEdit("directorMessage", "author")} />
          </p>
        </section>
      )}

      {/* Call To Action Section */}
      {content.CTA && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Call To Action</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.CTA.head}
            <EditIcon onClick={() => handleEdit("CTA", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.CTA.text}
            <EditIcon onClick={() => handleEdit("CTA", "text")} />
          </p>
        </section>
      )}

      {/* Partner Logos Section */}
      {content.partnerLogos && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Partner Logos</h2>
          <table className="min-w-full border text-2xl">
            <thead>
              <tr className="border-b">
                <th className="p-4">Preview</th>
                <th className="p-4">Key</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partnerLogos.map((logo) => (
                <tr key={logo.key} className="border-b">
                  <td className="p-4">
                    <img src={logo.src} alt={logo.key} className="h-20" />
                  </td>
                  <td className="p-4">{logo.key}</td>
                  <td className="p-4 space-x-4">
                    <button
                      onClick={() => handleEdit("partnerLogos", logo.key)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("partnerLogos", logo.key)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  <button
                    onClick={() => handleAdd("partnerLogos")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Add Logo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Client Logos Section */}
      {content.clientLogos && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Client Logos</h2>
          <table className="min-w-full border text-2xl">
            <thead>
              <tr className="border-b">
                <th className="p-4">Preview</th>
                <th className="p-4">Key</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientLogos.map((logo) => (
                <tr key={logo.key} className="border-b">
                  <td className="p-4">
                    <img src={logo.src} alt={logo.key} className="h-20" />
                  </td>
                  <td className="p-4">{logo.key}</td>
                  <td className="p-4 space-x-4">
                    <button
                      onClick={() => handleEdit("clientLogos", logo.key)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("clientLogos", logo.key)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  <button
                    onClick={() => handleAdd("clientLogos")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Add Logo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
