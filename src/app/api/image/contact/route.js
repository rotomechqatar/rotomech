// File: /api/image/contact/route.js

import { Buffer } from "buffer";
import path from "path";

export async function POST(req, { params }) {
  // For Contact Us, we fix the page as "contact-us"
  const page = "contact-us";

  const jsonFilePath = `src/data/${page}.json`;

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
  const getResponse = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getResponse.json();
  if (!getResponse.ok) {
    console.error("[CONTACT UPLOAD] Error fetching JSON file:", fileData);
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

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    const rawBody = await req.text();
    console.error(
      "[CONTACT UPLOAD] Failed to parse JSON payload. Raw body:",
      rawBody
    );
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload", details: rawBody }),
      { status: 400 }
    );
  }

  // Expected payload: { imageBase64, [optional] name, [optional] index }
  const { imageBase64 } = payload;
  let nameField = payload.name !== undefined ? payload.name : "";
  const providedIndex = payload.index;

  if (!imageBase64) {
    console.error("[CONTACT UPLOAD] Missing required parameter: imageBase64.");
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  // Use the top-level images array
  if (!currentContent.images) {
    console.error("[CONTACT UPLOAD] Images array not found in JSON.");
    return new Response(JSON.stringify({ error: "Images array not found" }), {
      status: 404,
    });
  }

  // Use provided index (default to 0)
  let idx = providedIndex !== undefined ? Number(providedIndex) : 0;
  const existingImagePath = currentContent.images[idx];
  if (!existingImagePath) {
    console.error("[CONTACT UPLOAD] No existing image found at index", idx);
    return new Response(
      JSON.stringify({ error: "Invalid image index for contact-us" }),
      { status: 400 }
    );
  }

  if (!nameField) {
    nameField = `contact-us-image_${idx}`;
  }
  const newFileName = `${nameField}.webp`;
  const posixNewImagePath = `/images/${newFileName}`;

  const posixPath = posixNewImagePath.replace(/\\/g, "/");

  // Delete the existing image file.
  let existingRepoImagePath = "";
  if (existingImagePath.startsWith("/images")) {
    existingRepoImagePath = "public" + existingImagePath;
  } else {
    existingRepoImagePath = existingImagePath.startsWith("/")
      ? existingImagePath.slice(1)
      : existingImagePath;
  }

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
      "[CONTACT UPLOAD] Failed to retrieve existing image file data for deletion:",
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
    message: `Delete existing Contact Us image at index ${idx}`,
    sha: imageFileSha,
    branch: branch,
  };
  const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${existingRepoImagePath}`;
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
      "[CONTACT UPLOAD] Error deleting existing image:",
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

  // Compute repository path for new image upload.
  let repoNewImagePath = "";
  if (posixPath.startsWith("/images")) {
    repoNewImagePath = "public" + posixPath;
  } else {
    repoNewImagePath = posixPath.startsWith("/")
      ? posixPath.slice(1)
      : posixPath;
  }

  const putPayload = {
    message: `Upload new image for contact-us`,
    content: imageBase64,
    branch: branch,
  };
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;

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
    console.error("[CONTACT UPLOAD] Error uploading new image:", putResult);
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }

  // Update JSON only if the new file name differs from the existing file's basename.
  const existingBaseName = path.basename(existingImagePath);
  if (newFileName !== existingBaseName) {
    currentContent.images[idx] = posixPath;
  } else {
  }

  const updatedContentString = JSON.stringify(currentContent, null, 2);
  const updatedContentBase64 =
    Buffer.from(updatedContentString).toString("base64");
  const updatePayload = {
    message: `Update image data for contact-us`,
    content: updatedContentBase64,
    sha: jsonSha,
    branch: branch,
  };
  const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}`;
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
    console.error("[CONTACT UPLOAD] Error updating JSON data:", updateResult);
    return new Response(
      JSON.stringify({
        error: "Failed to update JSON data",
        details: updateResult,
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Image uploaded successfully",
      imagePath: posixPath,
    }),
    { status: 200 }
  );
}
