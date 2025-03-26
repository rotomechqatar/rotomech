import { Buffer } from "buffer";
import { NextResponse } from "next/server";

// Helper: update the JSON file on GitHub
async function updateJsonFile(
  filePath,
  token,
  owner,
  repo,
  branch,
  newContent
) {
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getRes.json();
  const sha = fileData.sha;
  const contentString = JSON.stringify(newContent, null, 2);
  const contentBase64 = Buffer.from(contentString).toString("base64");

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Update JSON file after image upload`,
      content: contentBase64,
      sha,
      branch,
    }),
  });
  return await putRes.json();
}

export async function POST(request, { params }) {
  try {
    // Expecting JSON with { fileData, alt } where fileData is Base64 (without data URI prefix)
    const { fileData, alt } = await request.json();
    const page = params.page;
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log("Upload image for page:", page);

    // Determine next index for image keys by reading the JSON file.
    const jsonFilePath = `src/data/${page}.json`;
    const jsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
    const jsonRes = await fetch(jsonUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const jsonData = await jsonRes.json();
    const jsonContentStr = Buffer.from(jsonData.content, "base64").toString(
      "utf8"
    );
    const jsonContent = JSON.parse(jsonContentStr);
    console.log("Current JSON content:", jsonContent);

    // Determine next index for images. Look for keys starting with "image"
    let maxIndex = 0;
    for (const key in jsonContent) {
      if (key.startsWith("image")) {
        const num = parseInt(key.replace("image", ""), 10);
        if (!isNaN(num) && num > maxIndex) {
          maxIndex = num;
        }
      }
    }
    const newIndex = maxIndex + 1;
    // Generate new filename. Here we assume a prefix like "legacy-image-"
    const newFilename = `legacy-image-${newIndex}.webp`;
    const imagePath = `/images/${page}/${newFilename}`;
    console.log("New image will be:", imagePath);

    // Upload the image file to GitHub at public/images/{page}/{newFilename}
    const filePathRepo = `public/images/${page}/${newFilename}`;
    const putResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePathRepo}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload image ${newFilename} for ${page} via admin panel`,
          content: fileData,
          branch,
        }),
      }
    );
    const uploadData = await putResponse.json();
    if (!putResponse.ok) {
      console.error("Error uploading image file:", uploadData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to upload image",
          details: uploadData,
        }),
        { status: 500 }
      );
    }
    console.log("Image file uploaded successfully:", uploadData);

    // Update JSON file: add keys "image{newIndex}" and "alt{newIndex}"
    jsonContent[`image${newIndex}`] = imagePath;
    jsonContent[`alt${newIndex}`] = alt || "";
    console.log("Updated JSON content with new image:", jsonContent);
    const updateJsonResult = await updateJsonFile(
      jsonFilePath,
      token,
      owner,
      repo,
      branch,
      jsonContent
    );
    console.log("Updated JSON file after image upload:", updateJsonResult);

    return new NextResponse(
      JSON.stringify({ success: true, data: { uploadData, jsonContent } }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
