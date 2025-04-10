// scripts/delete.js
const { createClient } = require("@supabase/supabase-js");

// Read environment variables for your Supabase credentials
const supabaseUrl = "https://sizhsgzrnsabjyyuayqf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpemhzZ3pybnNhYmp5eXVheXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0Mjg1ODYsImV4cCI6MjA1OTAwNDU4Nn0.7Td9FeebjfJL3lec4vldmKY6gD6gk-PSVa8PXuSmgzs";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // List all files in the images folder
    const { data: files, error: listError } = await supabase.storage
      .from("rotomech")
      .list("images");
    if (listError) {
      console.error("Error listing files:", listError);
      process.exit(1);
    }

    if (!files || files.length === 0) {
      console.log("No files to delete.");
      return;
    }

    // Randomly choose one file from the list
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const fileName = randomFile.name;
    const filePath = `images/${fileName}`;

    // Delete the selected file
    const { error: deleteError } = await supabase.storage
      .from("rotomech")
      .remove([filePath]);

    if (deleteError) {
      console.error("Error deleting file:", deleteError);
      process.exit(1);
    }

    console.log(`Deleted file: ${fileName}`);
  } catch (err) {
    console.error("Error in delete.js:", err);
    process.exit(1);
  }
})();
