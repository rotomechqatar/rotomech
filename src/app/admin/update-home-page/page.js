// app/admin/page.jsx
"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // Fetch current content from our API endpoint
  useEffect(() => {
    fetch("/api/getContent")
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setDescription(data.description);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/updateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      setMessage(
        "Content updated successfully. A new build will be triggered."
      );
    } else {
      setMessage("Error updating content.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Panel</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block" }}>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "block" }}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />
        </div>
        <button type="submit">Update Content</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
