// File: /api/image/upload/[page]/route.js

import { Buffer } from "buffer";
import path from "path";

export async function POST(req, { params }) {
  // Await params before using its properties
  const { page } = await params;
  console.log("[UPLOAD] Received upload request for page:", page);

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

  // Clone the request before reading the body
  const reqClone = req.clone();
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    const rawBody = await reqClone.text();
    console.error("[UPLOAD] Failed to parse JSON payload. Raw body:", rawBody);
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload", details: rawBody }),
      { status: 400 }
    );
  }

  // Expected payload: { alt, imageBase64, section, [optional] name, [optional] index }
  const { alt, imageBase64, section } = payload;
  // "name" is optional for legacy (or other) sections; if provided it will override the existing name.
  let nameField = payload.name;
  // For legacy images, an optional "index" can be provided to indicate which image to replace.
  let providedIndex = payload.index;
  console.log("[UPLOAD] Incoming payload:", {
    alt,
    section,
    name: nameField,
    index: providedIndex,
  });

  if (!imageBase64 || !section || alt === undefined) {
    console.error("[UPLOAD] Missing required parameters in payload.");
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

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

  let newFileName;
  let posixNewImagePath;
  let repoNewImagePath = "";

  // We'll use different strategies depending on the section.
  if (section === "banner") {
    // For banner, we always update the single banner image.
    // If the user provides a new name, use it; otherwise, keep the existing filename.
    if (!nameField) {
      // Use existing filename by extracting it from the image path.
      // Assuming currentContent.banner.image is like "/images/home-banner-image.webp"
      const existingPath =
        currentContent.banner.image || "/images/home-banner-image.webp";
      nameField = path.basename(existingPath, ".webp");
    }
    newFileName = `${nameField}.webp`;
    posixNewImagePath = `/images/${newFileName}`;
    // Update banner keys directly later.
  } else if (section === "ourLegacy") {
    // Legacy section: only allowed to replace an existing image.
    // Determine which image index to update. Default to 1 if not provided.
    let index = providedIndex ? Number(providedIndex) : 1;
    if (!currentContent[section][`image${index}`]) {
      console.error(
        "[UPLOAD] No existing image found at index",
        index,
        "in legacy section."
      );
      return new Response(
        JSON.stringify({ error: "Cannot add new image in legacy section" }),
        { status: 400 }
      );
    }
    // Get the existing image path.
    const existingImagePath = currentContent[section][`image${index}`];
    // Extract existing name from the image path if no new name provided.
    if (!nameField) {
      nameField = path.basename(existingImagePath, ".webp");
    }
    newFileName = `${nameField}.webp`;
    posixNewImagePath = `/images/${newFileName}`;

    // Before uploading the new image, we need to delete the existing image file.
    // Compute the repo path for the existing image.
    let existingRepoImagePath = "";
    if (existingImagePath.startsWith("/images")) {
      existingRepoImagePath = "public" + existingImagePath;
    } else {
      existingRepoImagePath = existingImagePath.startsWith("/")
        ? existingImagePath.slice(1)
        : existingImagePath;
    }
    console.log(
      "[UPLOAD] Deleting existing legacy image at repo path:",
      existingRepoImagePath
    );

    // Get file details (to retrieve sha) for the existing image.
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
        "[UPLOAD] Failed to retrieve existing image file data for deletion:",
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
    // Delete the existing image file.
    const deletePayload = {
      message: `Delete legacy image at index ${index} for ${section} on ${page}`,
      sha: imageFileSha,
      branch: branch,
    };
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${existingRepoImagePath}`;
    console.log("[UPLOAD] Deleting existing image via URL:", deleteUrl);
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
        "[UPLOAD] Error deleting existing legacy image:",
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
    console.log("[UPLOAD] Existing legacy image deleted successfully.");
  } else {
    // For any other section that allows multiple images, append a new one.
    let index = 1;
    while (currentContent[section][`image${index}`]) {
      index++;
    }
    // For these sections, require name in payload (if not provided, error).
    if (!nameField) {
      console.error(
        "[UPLOAD] Name is required for new images in section:",
        section
      );
      return new Response(
        JSON.stringify({ error: "Name is required for new images" }),
        { status: 400 }
      );
    }
    newFileName = `${nameField}.webp`;
    posixNewImagePath = `/images/${newFileName}`;
  }

  console.log("[UPLOAD] New file name:", newFileName);
  console.log("[UPLOAD] New image path (raw):", posixNewImagePath);

  // Normalize path to POSIX.
  const posixPath = posixNewImagePath.replace(/\\/g, "/");
  console.log("[UPLOAD] Normalized image path (POSIX):", posixPath);

  // Compute repo path for upload.
  if (posixPath.startsWith("/images")) {
    repoNewImagePath = "public" + posixPath;
  } else {
    repoNewImagePath = posixPath.startsWith("/")
      ? posixPath.slice(1)
      : posixPath;
  }
  console.log("[UPLOAD] Repo new image path for upload:", repoNewImagePath);

  // Upload the new image to GitHub.
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
  if (section === "banner") {
    // For banner, update directly. Use provided alt; if name was provided, update image name, else keep existing.
    currentContent.banner.image = posixPath;
    currentContent.banner.alt = alt;
    if (payload.name) {
      currentContent.banner.name = payload.name;
    }
  } else if (section === "ourLegacy") {
    // For legacy, update the existing image entry.
    let index = providedIndex ? Number(providedIndex) : 1;
    currentContent[section][`image${index}`] = posixPath;
    currentContent[section][`alt${index}`] = alt;
    currentContent[section][`name${index}`] = nameField;
  } else {
    // For other sections, add a new image entry.
    let index = 1;
    while (currentContent[section][`image${index}`]) {
      index++;
    }
    currentContent[section][`image${index}`] = posixPath;
    currentContent[section][`alt${index}`] = alt;
    currentContent[section][`name${index}`] = nameField;
  }
  console.log("[UPLOAD] Updated JSON content with new image data.");

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
