// File: /api/image/upload/[page]/route.js

import { Buffer } from "buffer";

export async function POST(req, { params }) {
  // Get the page parameter.
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
  console.log("[UPLOAD] Successfully loaded JSON content.");

  // Parse incoming form data.
  const formData = await req.formData();
  const nameField = formData.get("name");
  const altField = formData.get("alt") || "";
  const section = formData.get("section"); // should be "banner"
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

  // Ensure the banner section exists in JSON.
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

  // Determine the repository path for the banner image.
  let repoNewImagePath;
  let newImagePath;
  if (currentContent[section].image) {
    // Use the existing banner image path.
    newImagePath = currentContent[section].image;
    repoNewImagePath = newImagePath.startsWith("/images")
      ? "public" + newImagePath
      : newImagePath;
    console.log(
      "[UPLOAD] Found existing banner image. Using file path:",
      newImagePath
    );
  } else {
    // No existing banner image, compute a new one.
    const newFileName = `${nameField}.webp`;
    newImagePath = `/images/${newFileName}`;
    repoNewImagePath = newImagePath.startsWith("/images")
      ? "public" + newImagePath
      : newImagePath;
    console.log(
      "[UPLOAD] No existing banner image. New file name:",
      newFileName
    );
    console.log("[UPLOAD] New image path (raw):", newImagePath);
  }
  const posixNewImagePath = newImagePath.replace(/\\/g, "/");
  console.log("[UPLOAD] Repo new image path for upload:", repoNewImagePath);

  // Define URL for the image file in the repository.
  const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;
  console.log("[UPLOAD] File URL:", fileUrl);

  // --- If an existing banner image exists, delete it ---
  const fileMetaResponse = await fetch(fileUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (fileMetaResponse.ok) {
    const fileInfo = await fileMetaResponse.json();
    const latestFileSha = fileInfo.sha;
    const deletePayload = {
      message: `Delete existing banner image for ${page}`,
      sha: latestFileSha,
      branch: branch,
    };
    console.log("[UPLOAD] Deleting existing file with payload:", deletePayload);
    const deleteResponse = await fetch(fileUrl, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deletePayload),
    });
    if (!deleteResponse.ok) {
      const deleteResult = await deleteResponse.json();
      console.error("[UPLOAD] Error deleting existing image:", deleteResult);
      if (deleteResponse.status === 409) {
        return new Response(
          JSON.stringify({
            error: "Please publish changes first and then update banner image",
            details: deleteResult,
          }),
          { status: 409 }
        );
      }
      return new Response(
        JSON.stringify({
          error: "Failed to delete existing image",
          details: deleteResult,
        }),
        { status: 500 }
      );
    }
    console.log("[UPLOAD] Existing banner image deleted successfully.");
  } else {
    console.log("[UPLOAD] No existing banner image found at", repoNewImagePath);
  }

  // --- Upload the new banner image ---
  const putPayload = {
    message: `Upload new banner image for ${page}`,
    content: imageBase64,
    branch: branch,
  };
  console.log("[UPLOAD] Uploading new image to URL:", fileUrl);
  const putResponse = await fetch(fileUrl, {
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
    if (putResponse.status === 409) {
      return new Response(
        JSON.stringify({
          error: "Please publish changes first and then update banner image",
          details: putResult,
        }),
        { status: 409 }
      );
    }
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }
  console.log("[UPLOAD] New banner image uploaded successfully.");

  // --- Update the JSON file ---
  // For banner, update only the image path and alt text.
  currentContent[section].image = posixNewImagePath;
  currentContent[section].alt = altField;
  console.log("[UPLOAD] Updated JSON content for banner.");

  const updatedContentString = JSON.stringify(currentContent, null, 2);
  const updatedContentBase64 =
    Buffer.from(updatedContentString).toString("base64");
  const updatePayload = {
    message: `Update banner data for ${page}`,
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

  // Return the updated banner details.
  return new Response(
    JSON.stringify({
      banner: {
        image: posixNewImagePath,
        alt: altField,
      },
      message: "Banner image uploaded successfully",
    }),
    { status: 200 }
  );
}
