"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  // Content editing states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [updatedContent, setUpdatedContent] = useState(null);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadImageName, setUploadImageName] = useState(""); // custom name input

  // For demo, we'll use a static image list.
  // In a full app, you'd fetch the list from GitHub via an API.
  const [images, setImages] = useState(["example.jpg"]);

  // Fetch current content on mount
  useEffect(() => {
    fetch("/api/getContent")
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.image || "");
      })
      .catch((err) => console.error("Error fetching content:", err));
  }, []);

  // Handler for updating content (text & image URL)
  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUpdatedContent(null);
    try {
      // Always ensure the image URL is prefixed with "/images/"
      const finalImageUrl = imageUrl.startsWith("/images/")
        ? imageUrl
        : `/images/${imageUrl}`;
      const res = await fetch("/api/updateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, image: finalImageUrl }),
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

  // Handler for file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handler for image upload
  const handleUpload = async () => {
    setUploadMessage("");
    if (!selectedFile) {
      setUploadMessage("No file selected.");
      return;
    }
    // Check file type (must be webp)
    if (selectedFile.type !== "image/webp") {
      setUploadMessage("Only WEBP images are allowed.");
      return;
    }
    // Check file size (< 5 MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadMessage("Image must be less than 5 MB.");
      return;
    }
    // Check if the image name is provided and not already taken
    if (!uploadImageName.trim()) {
      setUploadMessage("Please provide an image name (without extension).");
      return;
    }
    // Append the .webp extension (if not already provided)
    let finalImageName = uploadImageName.trim();
    if (!finalImageName.toLowerCase().endsWith(".webp")) {
      finalImageName += ".webp";
    }
    // Verify if the image name already exists in our images list
    if (images.includes(finalImageName)) {
      setUploadMessage("An image with that name already exists.");
      return;
    }
    // Read file as Base64 string
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1]; // remove data URI prefix
      const res = await fetch("/api/uploadImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: finalImageName,
          fileData: base64Data,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setUploadMessage("Image uploaded successfully!");
        // Update image list
        setImages((prev) => [...prev, finalImageName]);
        // Update imageUrl field with the new image path
        setImageUrl(`/images/${finalImageName}`);
      } else {
        setUploadMessage(`Error: ${result.error}`);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handler for image deletion
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
      // If deleted image is currently set in the content, clear it
      if (imageUrl === `/images/${filename}`) {
        setImageUrl("");
      }
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
          <div>
            <label className="block font-medium mb-1">Image URL:</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          {imageUrl && (
            <div className="mt-4">
              <p className="font-medium">Current Image Preview:</p>
              <img src={imageUrl} alt="Current" className="mt-2 max-h-60" />
            </div>
          )}
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
        <div className="flex flex-col space-y-4">
          <input type="file" onChange={handleFileChange} className="block" />
          <div>
            <label className="block font-medium mb-1">
              Image Name (without extension):
            </label>
            <input
              type="text"
              value={uploadImageName}
              onChange={(e) => setUploadImageName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter image name"
            />
          </div>
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
