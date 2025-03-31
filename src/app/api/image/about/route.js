// File: /api/image/about/route.js

import { Buffer } from "buffer";
import path from "path";

export async function POST(req, { params }) {
  // For About Us, we fix the page as "about-us"
  const page = "about-us";
  console.log("[ABOUT UPLOAD] Received upload request for about us page.");

  const jsonFilePath = `src/data/${page}.json`;
  console.log("[ABOUT UPLOAD] JSON file path:", jsonFilePath);

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";
  console.log(
    "[ABOUT UPLOAD] Using branch:",
    branch,
    "owner:",
    owner,
    "repo:",
    repo
  );

  // Fetch the current JSON file from GitHub.
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
  console.log("[ABOUT UPLOAD] Fetching JSON file from URL:", getUrl);
  const getResponse = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getResponse.json();
  if (!getResponse.ok) {
    console.error("[ABOUT UPLOAD] Error fetching JSON file:", fileData);
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
    "[ABOUT UPLOAD] Successfully loaded JSON content from GitHub.",
    currentContent
  );

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    const rawBody = await req.text();
    console.error(
      "[ABOUT UPLOAD] Failed to parse JSON payload. Raw body:",
      rawBody
    );
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload", details: rawBody }),
      { status: 400 }
    );
  }

  // Expected payload: { imageBase64, section, [optional] name, [optional] index }
  // For About Us, alt is not used.
  const { imageBase64, section } = payload;
  let nameField = payload.name !== undefined ? payload.name : "";
  const providedIndex = payload.index;

  console.log("[ABOUT UPLOAD] Incoming payload:", {
    section,
    name: nameField,
    index: providedIndex,
  });

  if (!imageBase64 || !section) {
    console.error("[ABOUT UPLOAD] Missing required parameters in payload.");
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  if (!currentContent[section] || !currentContent[section].images) {
    console.error(
      "[ABOUT UPLOAD] Section 'aboutUs' or images array not found in JSON."
    );
    return new Response(JSON.stringify({ error: "Section not found" }), {
      status: 404,
    });
  }

  // For aboutUs, use the provided index (default to 0)
  let idx = providedIndex !== undefined ? Number(providedIndex) : 0;
  const existingImagePath = currentContent[section].images[idx];
  if (!existingImagePath) {
    console.error(
      "[ABOUT UPLOAD] No existing image found at index",
      idx,
      "in aboutUs section."
    );
    return new Response(
      JSON.stringify({ error: "Invalid image index for aboutUs" }),
      { status: 400 }
    );
  }

  // Determine new file name; if name not provided, use a default based on index.
  if (!nameField) {
    nameField = `about-us-image_${idx}`;
  }
  const newFileName = `${nameField}.webp`;
  const posixNewImagePath = `/images/${newFileName}`;
  console.log("[ABOUT UPLOAD] New file name:", newFileName);
  console.log("[ABOUT UPLOAD] New image path (raw):", posixNewImagePath);

  const posixPath = posixNewImagePath.replace(/\\/g, "/");
  console.log("[ABOUT UPLOAD] Normalized image path (POSIX):", posixPath);

  // Delete the existing image file first.
  let existingRepoImagePath = "";
  if (existingImagePath.startsWith("/images")) {
    existingRepoImagePath = "public" + existingImagePath;
  } else {
    existingRepoImagePath = existingImagePath.startsWith("/")
      ? existingImagePath.slice(1)
      : existingImagePath;
  }
  console.log(
    "[ABOUT UPLOAD] Deleting existing image at repo path:",
    existingRepoImagePath
  );

  // Get file details to retrieve SHA for deletion.
  const getImageUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${existingRepoImagePath}?ref=${branch}`;
  const getImageResponse = await fetch(getImageUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const imageFileData = await getImageResponse.json();
  if (!getImageResponse.ok) {
    console.error(
      "[ABOUT UPLOAD] Failed to retrieve existing image file data for deletion:",
      imageFileData
    );
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve existing image file data",
        details: imageFileData,
      }),
      { status: 500 }
    );
  }
  const imageFileSha = imageFileData.sha;
  const deletePayload = {
    message: `Delete existing About Us image at index ${idx}`,
    sha: imageFileSha,
    branch: branch,
  };
  const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${existingRepoImagePath}`;
  console.log("[ABOUT UPLOAD] Deleting existing image via URL:", deleteUrl);
  const deleteResponse = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deletePayload),
  });
  const deleteResult = await deleteResponse.json();
  if (!deleteResponse.ok) {
    console.error(
      "[ABOUT UPLOAD] Error deleting existing image:",
      deleteResult
    );
    return new Response(
      JSON.stringify({
        error: "Failed to delete existing image",
        details: deleteResult,
      }),
      { status: 500 }
    );
  }
  console.log("[ABOUT UPLOAD] Existing image deleted successfully.");

  // Now compute repository path for new image upload.
  let repoNewImagePath = "";
  if (posixPath.startsWith("/images")) {
    repoNewImagePath = "public" + posixPath;
  } else {
    repoNewImagePath = posixPath.startsWith("/")
      ? posixPath.slice(1)
      : posixPath;
  }
  console.log(
    "[ABOUT UPLOAD] Repo new image path for upload:",
    repoNewImagePath
  );

  const putPayload = {
    message: `Upload new image for ${section} on ${page}`,
    content: imageBase64,
    branch: branch,
  };
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;
  console.log("[ABOUT UPLOAD] Uploading new image to URL:", putUrl);
  console.log("[ABOUT UPLOAD] PUT payload:", putPayload);

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
    console.error("[ABOUT UPLOAD] Error uploading new image:", putResult);
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }
  console.log("[ABOUT UPLOAD] New image uploaded successfully.");

  // Update JSON only if the new file name is different from the existing file's basename.
  const existingBaseName = path.basename(existingImagePath);
  if (newFileName !== existingBaseName) {
    currentContent[section].images[idx] = posixPath;
    console.log("[ABOUT UPLOAD] JSON content updated with new image path.");
  } else {
    console.log("[ABOUT UPLOAD] Name unchanged; JSON content not updated.");
  }

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
  console.log("[ABOUT UPLOAD] Updating JSON file at URL:", updateUrl);
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
    console.error("[ABOUT UPLOAD] Error updating JSON data:", updateResult);
    return new Response(
      JSON.stringify({
        error: "Failed to update JSON data",
        details: updateResult,
      }),
      { status: 500 }
    );
  }
  console.log("[ABOUT UPLOAD] JSON file updated successfully.");

  console.log(
    "[ABOUT UPLOAD] Image uploaded successfully with filename:",
    newFileName
  );
  return new Response(
    JSON.stringify({
      message: "Image uploaded successfully",
      imagePath: posixPath,
    }),
    { status: 200 }
  );
}
