import { supabase } from "./supabaseClient";

// Helper to sanitize strings: removes any characters that are not letters or numbers.
const sanitizeString = (str) => {
  console.log("Sanitizing string:", str);
  return str.replace(/[^a-zA-Z0-9]/g, "");
};

// Returns a timestamp string with date and time without disallowed characters.
const getTimestamp = () => {
  // Get ISO string, e.g. "2025-03-25T17:59:13.123Z"
  const iso = new Date().toISOString();
  // Remove milliseconds and the 'Z', then replace colons with hyphens for file-system compatibility.
  return iso.split(".")[0].replace(/:/g, "-");
};

/*
  This function prepares a new file name using the applicant's name and the current date and time,
  then uploads the file to the specified Supabase bucket.

  Parameters:
    file: the File object selected by the user.
    userName: the name from the form, used for the file name.
*/
export const uploadFileWithCustomName = async (file, userName) => {
  console.log(
    "uploadFileWithCustomName called with file:",
    file,
    "and userName:",
    userName
  );
  if (!file) {
    console.error("No file provided.");
    return null;
  }

  // Extract the file extension (e.g., "pdf", "docx").
  const ext = file.name.split(".").pop();
  console.log("File extension:", ext);

  // Sanitize the userName to remove spaces and special characters.
  const sanitizedUserName = sanitizeString(userName);
  console.log("Sanitized userName:", sanitizedUserName);

  // Get a timestamp string (including date and time).
  const timestamp = getTimestamp();
  console.log("Timestamp:", timestamp);

  // Build the new file name.
  const newFileName = `${sanitizedUserName}_${timestamp}.${ext}`;
  console.log("New file name:", newFileName);

  // Use the correct bucket name from your Supabase dashboard.
  // Make sure this exactly matches your bucket name.
  const bucketName = "rotomech";
  console.log("Uploading file to bucket:", bucketName);

  // Log the full upload path for debugging.
  const uploadPath = `public/${newFileName}`;
  console.log("Upload path:", uploadPath);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(uploadPath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("File upload error:", error);
    return null;
  }

  console.log("File upload successful, data:", data);

  // Get the public URL. Note that the property is `publicUrl` (lowercase 'l').
  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  console.log("Public URL retrieved:", publicData.publicUrl);
  return publicData.publicUrl;
};
