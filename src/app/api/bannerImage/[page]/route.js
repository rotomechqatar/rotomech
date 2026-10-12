// File: /api/image/upload/[page]/route.js

import { Buffer } from "buffer";

export async function POST(req, { params }) {
  // Get the page parameter.
  const { page } = await params;

  // Define the JSON file path for the page.
  const jsonFilePath = `src/data/${page}.json`;

  // Retrieve current JSON file from GitHub.
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

  // Parse incoming form data.
  const formData = await req.formData();
  const nameField = formData.get("name");
  const altField = formData.get("alt") || "";
  const section = formData.get("section"); // should be "banner"
  const file = formData.get("file");


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
  } else {
    // No existing banner image, compute a new one.
    const newFileName = `${nameField}.webp`;
    newImagePath = `/images/${newFileName}`;
    repoNewImagePath = newImagePath.startsWith("/images")
      ? "public" + newImagePath
      : newImagePath;
  }
  const posixNewImagePath = newImagePath.replace(/\\/g, "/");

  // Define URL for the image file in the repository.
  const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;

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
  } else {
  }

  // --- Upload the new banner image ---
  const putPayload = {
    message: `Upload new banner image for ${page}`,
    content: imageBase64,
    branch: branch,
  };
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

  // --- Update the JSON file ---
  // For banner, update only the image path and alt text.
  currentContent[section].image = posixNewImagePath;
  currentContent[section].alt = altField;

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
