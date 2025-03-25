"use client";
import { useState, useEffect } from "react";

// A simple inline pencil edit icon component
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

export default function AboutAdminPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch About Us content from the API (from about-us.json)
  useEffect(() => {
    async function fetchContent() {
      console.log("Fetching about-us content from /api/getContent/about-us");
      try {
        const res = await fetch("/api/getContent/about-us", {
          credentials: "include",
        });
        console.log("Fetch response status:", res.status);
        if (!res.ok) {
          throw new Error("Failed to fetch about-us content");
        }
        const data = await res.json();
        console.log("Received about-us data:", data);
        setContent(data);
      } catch (err) {
        console.error("Error fetching about-us content:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  if (loading)
    return <div className="text-4xl">Loading about-us content...</div>;
  if (error) return <div className="text-4xl text-red-600">Error: {error}</div>;

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
      <h1 className="text-5xl font-bold mb-8">Edit About Us Content</h1>

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

      {/* About Us Section */}
      {content.aboutUs && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">About Us</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.aboutUs.head}
            <EditIcon onClick={() => handleEdit("aboutUs", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.aboutUs.text}
            <EditIcon onClick={() => handleEdit("aboutUs", "text")} />
          </p>
          <p className="text-2xl">
            <strong>Text2:</strong> {content.aboutUs.text2}
            <EditIcon onClick={() => handleEdit("aboutUs", "text2")} />
          </p>
          <div className="mt-4">
            <h3 className="text-3xl font-semibold mb-2">Images</h3>
            <table className="min-w-full border text-2xl">
              <thead>
                <tr className="border-b">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Index</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.aboutUs.images &&
                  content.aboutUs.images.map((img, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-4">
                        <img
                          src={img}
                          alt={`aboutUs image ${idx + 1}`}
                          className="h-40"
                        />
                      </td>
                      <td className="p-4">Image {idx + 1}</td>
                      <td className="p-4 space-x-4">
                        <button
                          onClick={() =>
                            handleEdit("aboutUs", `images[${idx}]`)
                          }
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("aboutUs", `images[${idx}]`)
                          }
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
                      onClick={() => handleAdd("aboutUs_images")}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add Image
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Our Mission Section */}
      {content.ourMission && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Our Mission</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.ourMission.head}
            <EditIcon onClick={() => handleEdit("ourMission", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.ourMission.text}
            <EditIcon onClick={() => handleEdit("ourMission", "text")} />
          </p>
        </section>
      )}

      {/* Our Vision Section */}
      {content.ourVision && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Our Vision</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.ourVision.head}
            <EditIcon onClick={() => handleEdit("ourVision", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.ourVision.text}
            <EditIcon onClick={() => handleEdit("ourVision", "text")} />
          </p>
        </section>
      )}

      {/* Core Values Section */}
      {content.coreValues && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Core Values</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.coreValues.head}
            <EditIcon onClick={() => handleEdit("coreValues", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.coreValues.text}
            <EditIcon onClick={() => handleEdit("coreValues", "text")} />
          </p>
          <div className="mt-4">
            <h3 className="text-3xl font-semibold mb-2">Values & Icons</h3>
            <table className="min-w-full border text-2xl">
              <thead>
                <tr className="border-b">
                  <th className="p-4">Icon</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.coreValues.values &&
                  content.coreValues.values.map((value, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-4">
                        <img
                          src={content.coreValues.icons[idx]}
                          alt={value}
                          className="h-20"
                        />
                      </td>
                      <td className="p-4">{value}</td>
                      <td className="p-4 space-x-4">
                        <button
                          onClick={() =>
                            handleEdit("coreValues", `value[${idx}]`)
                          }
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("coreValues", `value[${idx}]`)
                          }
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
                      onClick={() => handleAdd("coreValues")}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Add Value/Icon
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      {content.whyChooseUs && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Why Choose Us</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.whyChooseUs.head}
            <EditIcon onClick={() => handleEdit("whyChooseUs", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.whyChooseUs.text}
            <EditIcon onClick={() => handleEdit("whyChooseUs", "text")} />
          </p>
        </section>
      )}

      {/* CTA Section */}
      {content.cta && (
        <section className="border p-4 rounded">
          <h2 className="text-3xl font-semibold mb-2">Call To Action</h2>
          <p className="text-2xl">
            <strong>Head:</strong> {content.cta.head}
            <EditIcon onClick={() => handleEdit("cta", "head")} />
          </p>
          <p className="text-2xl">
            <strong>Tagline:</strong> {content.cta.tagline}
            <EditIcon onClick={() => handleEdit("cta", "tagline")} />
          </p>
          <p className="text-2xl">
            <strong>Text:</strong> {content.cta.text}
            <EditIcon onClick={() => handleEdit("cta", "text")} />
          </p>
        </section>
      )}
    </div>
  );
}
