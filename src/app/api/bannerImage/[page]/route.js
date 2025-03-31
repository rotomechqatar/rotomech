// File: /api/image/upload/[page]/route.js

import { Buffer } from "buffer";
import path from "path";

export async function POST(req, { params }) {
  // Await the dynamic params first.
  const { page } = await params;
  console.log("[UPLOAD] Received upload request for page:", page);

  // Define the JSON file path for the page.
  const jsonFilePath = `src/data/${page}.json`;
  console.log("[UPLOAD] JSON file path:", jsonFilePath);

  // Retrieve current JSON file from GitHub.
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";
  console.log("[UPLOAD] Using branch:", branch, "owner:", owner, "repo:", repo);

  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
  console.log("[UPLOAD] Fetching JSON file from URL:", getUrl);
  const getResponse = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getResponse.json();
  if (!getResponse.ok) {
    console.error("[UPLOAD] Error fetching JSON file:", fileData);
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve current content info",
        details: fileData,
      }),
      { status: 500 }
    );
  }
  const jsonSha = fileData.sha;
  const currentContentString = Buffer.from(fileData.content, "base64").toString(
    "utf8"
  );
  const currentContent = JSON.parse(currentContentString);
  console.log(
    "[UPLOAD] Successfully loaded JSON content from GitHub.",
    currentContent
  );

  // Use formData() to parse the incoming multipart/form-data payload.
  const formData = await req.formData();
  const nameField = formData.get("name");
  const altField = formData.get("alt") || "";
  const section = formData.get("section");
  const file = formData.get("file");

  console.log("[UPLOAD] Incoming form data:", {
    name: nameField,
    alt: altField,
    section,
    fileType: file?.type,
  });

  if (!nameField || !section || !file) {
    console.error("[UPLOAD] Missing parameters in form data.");
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  // Validate file type – only WebP images are allowed.
  if (file.type !== "image/webp") {
    console.error("[UPLOAD] Invalid file type:", file.type);
    return new Response(
      JSON.stringify({ error: "Only webp images are allowed" }),
      { status: 400 }
    );
  }

  // Convert file to a Base64‑encoded string.
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = fileBuffer.toString("base64");

  // Ensure the target section exists in the JSON file.
  if (!currentContent[section]) {
    console.error(
      "[UPLOAD] Section not found in JSON for page:",
      page,
      "section:",
      section
    );
    return new Response(JSON.stringify({ error: "Section not found" }), {
      status: 404,
    });
  }

  // Determine the next available index by checking for existing keys.
  let index = 1;
  while (currentContent[section][`image${index}`]) {
    index++;
  }
  console.log("[UPLOAD] Next available index for section", section, ":", index);

  // Construct new file name using the provided name and a .webp extension.
  const newFileName = `${nameField}.webp`;
  console.log("[UPLOAD] New file name:", newFileName);

  // Build new image path (we’re storing images in public/images).
  const newImagePath = `/images/${newFileName}`;
  console.log("[UPLOAD] New image path (raw):", newImagePath);

  // Normalize the path to POSIX (forward slashes).
  const posixNewImagePath = newImagePath.replace(/\\/g, "/");
  console.log("[UPLOAD] New image path (POSIX):", posixNewImagePath);

  // Compute the repo path for upload: if path starts with /images, prefix with "public".
  let repoNewImagePath = "";
  if (posixNewImagePath.startsWith("/images")) {
    repoNewImagePath = "public" + posixNewImagePath;
  } else {
    repoNewImagePath = posixNewImagePath.startsWith("/")
      ? posixNewImagePath.slice(1)
      : posixNewImagePath;
  }
  console.log("[UPLOAD] Repo new image path for upload:", repoNewImagePath);

  // --- Upload the new image to GitHub ---
  const putPayload = {
    message: `Upload new image for ${section} on ${page}`,
    content: imageBase64,
    branch: branch,
  };
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;
  console.log("[UPLOAD] Uploading new image to URL:", putUrl);
  console.log("[UPLOAD] PUT payload:", putPayload);

  const putResponse = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(putPayload),
  });
  const putResult = await putResponse.json();
  if (!putResponse.ok) {
    console.error("[UPLOAD] Error uploading new image:", putResult);
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }
  console.log("[UPLOAD] New image uploaded successfully.");

  // Update JSON content with new image data.
  currentContent[section][`image${index}`] = posixNewImagePath;
  currentContent[section][`alt${index}`] = altField;
  currentContent[section][`name${index}`] = nameField;
  console.log("[UPLOAD] Updated JSON content with new image keys.");

  // Write updated JSON content back to GitHub.
  const updatedContentString = JSON.stringify(currentContent, null, 2);
  const updatedContentBase64 =
    Buffer.from(updatedContentString).toString("base64");
  const updatePayload = {
    message: `Update image data for ${section} on ${page}`,
    content: updatedContentBase64,
    sha: jsonSha,
    branch: branch,
  };
  const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}`;
  console.log("[UPLOAD] Updating JSON file at URL:", updateUrl);
  const updateResponse = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatePayload),
  });
  const updateResult = await updateResponse.json();
  if (!updateResponse.ok) {
    console.error("[UPLOAD] Error updating JSON data:", updateResult);
    return new Response(
      JSON.stringify({
        error: "Failed to update JSON data",
        details: updateResult,
      }),
      { status: 500 }
    );
  }
  console.log("[UPLOAD] JSON file updated successfully.");

  console.log(
    "[UPLOAD] Image uploaded successfully with filename:",
    newFileName,
    "and index:",
    index
  );
  return new Response(
    JSON.stringify({
      message: "Image uploaded successfully",
      imagePath: posixNewImagePath,
      index,
    }),
    { status: 200 }
  );
}
