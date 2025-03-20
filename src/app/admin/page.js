"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  // Content editing states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [updatedContent, setUpdatedContent] = useState(null);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  // For demo, we'll use a static image list.
  // In a full app, you'd fetch the list from GitHub via an API.
  const [images, setImages] = useState(["example.jpg"]);

  // Fetch current content on mount
  useEffect(() => {
    fetch("/api/getContent")
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setDescription(data.description);
      })
      .catch((err) => console.error("Error fetching content:", err));
  }, []);

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUpdatedContent(null);
    try {
      const res = await fetch("/api/updateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Content updated successfully.");
        setUpdatedContent(result.content);
      } else {
        setMessage(`Error updating content: ${result.error}`);
      }
    } catch (error) {
      setMessage("Error updating content: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1]; // remove data URI prefix
      const res = await fetch("/api/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          fileData: base64Data,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setUploadMessage("Image uploaded successfully!");
        // Update image list if needed
        setImages((prev) => [...prev, selectedFile.name]);
      } else {
        setUploadMessage(`Error: ${result.error}`);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = async (filename) => {
    const res = await fetch("/api/deleteImage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    const result = await res.json();
    if (res.ok) {
      alert("Image deleted successfully!");
      setImages((prev) => prev.filter((img) => img !== filename));
    } else {
      alert(`Error deleting image: ${result.error}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Content Update Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Update Content</h2>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-24"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Content
          </button>
        </form>
        {message && <p className="mt-4 text-lg">{message}</p>}
        {updatedContent && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Updated Content:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(updatedContent, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Image Upload</h2>
        <div className="flex items-center space-x-4">
          <input type="file" onChange={handleFileChange} className="block" />
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Upload Image
          </button>
        </div>
        {uploadMessage && <p className="mt-2">{uploadMessage}</p>}
      </div>

      {/* Image List Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Images</h2>
        <ul className="space-y-2">
          {images.map((img) => (
            <li
              key={img}
              className="flex items-center justify-between bg-gray-50 p-4 rounded"
            >
              <span>{img}</span>
              <button
                onClick={() => handleDelete(img)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
