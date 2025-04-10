// scripts/upload.js
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = "https://sizhsgzrnsabjyyuayqf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpemhzZ3pybnNhYmp5eXVheXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Mjg1ODYsImV4cCI6MjA1OTAwNDU4Nn0.7Td9FeebjfJL3lec4vldmKY6gD6gk-PSVa8PXuSmgzs";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    const activeDir = path.join(__dirname, "..", "public", "active");
    const files = fs
      .readdirSync(activeDir)
      .filter((file) => file.match(/\.(jpg|jpeg|png|gif)$/i));

    if (files.length === 0) {
      console.log("No image files found in public/active directory.");
      return;
    }

    // Pick a random file
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(activeDir, randomFile);
    const fileContent = fs.readFileSync(filePath);

    // Create a new name with a timestamp
    const newName = `${Date.now()}_${randomFile}`;
    const supabasePath = `images/${newName}`;

    // Optionally, you can determine the content type based on your file extension.
    // For simplicity, we assume JPEG; adjust if needed.
    const { error, data } = await supabase.storage
      .from("rotomech")
      .upload(supabasePath, fileContent, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Upload error:", error);
      process.exit(1);
    }
    console.log("Uploaded file:", data);
  } catch (err) {
    console.error("Error in upload.js:", err);
    process.exit(1);
  }
})();
