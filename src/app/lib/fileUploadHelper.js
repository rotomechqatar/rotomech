/*
  Uploads an applicant's CV to the Cloudflare R2 bucket through /api/upload-cv
  and returns its public URL, or null if the upload failed.

  Parameters:
    file: the File object selected by the user.
    userName: the name from the form, used in the stored file name.
*/
export const uploadFileWithCustomName = async (file, userName) => {
  if (!file) {
    console.error("No file provided.");
    return null;
  }

  const body = new FormData();
  body.append("file", file);
  body.append("name", userName || "");

  try {
    const res = await fetch("/api/upload-cv", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      console.error("File upload error:", res.status, data.error);
      return null;
    }
    return data.url;
  } catch (error) {
    console.error("File upload error:", error);
    return null;
  }
};
