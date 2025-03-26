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
  console.log("[POST:updateJsonFile] Fetching JSON from:", filePath);
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getRes.json();
  console.log("[POST:updateJsonFile] Received fileData:", fileData);
  const sha = fileData.sha;
  const contentString = JSON.stringify(newContent, null, 2);
  const contentBase64 = Buffer.from(contentString).toString("base64");

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  console.log("[POST:updateJsonFile] PUT URL:", putUrl);
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
  const putData = await putRes.json();
  console.log("[POST:updateJsonFile] Updated JSON response:", putData);
  return putData;
}

export async function POST(request, { params }) {
  console.log("[POST] Starting POST endpoint for image upload");
  try {
    // Expecting JSON with { fileData, alt } where fileData is Base64 (without data URI prefix)
    const body = await request.json();
    console.log("[POST] Received request body:", body);
    const { fileData, alt } = body;
    const page = params.page;
    console.log("[POST] params.page:", page);

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log("[POST] Using token, owner, repo, branch:", {
      token: !!token,
      owner,
      repo,
      branch,
    });

    console.log("[POST] Fetching current JSON content");
    // Determine next index for image keys by reading the JSON file.
    const jsonFilePath = `src/data/${page}.json`;
    const jsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
    console.log("[POST] JSON GET URL:", jsonUrl);
    const jsonRes = await fetch(jsonUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const jsonData = await jsonRes.json();
    console.log("[POST] Received JSON file data:", jsonData);
    const jsonContentStr = Buffer.from(jsonData.content, "base64").toString(
      "utf8"
    );
    const jsonContent = JSON.parse(jsonContentStr);
    console.log("[POST] Current JSON content:", jsonContent);

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
    console.log("[POST] New image will be:", imagePath);

    // Upload the image file to GitHub at public/images/{page}/{newFilename}
    const filePathRepo = `public/images/${page}/${newFilename}`;
    console.log(
      "[POST] File upload URL:",
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePathRepo}`
    );
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
    console.log("[POST] Upload response data:", uploadData);
    if (!putResponse.ok) {
      console.error("[POST] Error uploading image file:", uploadData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to upload image",
          details: uploadData,
        }),
        { status: 500 }
      );
    }
    console.log("[POST] Image file uploaded successfully");

    // Update JSON file: add keys "image{newIndex}" and "alt{newIndex}"
    jsonContent[`image${newIndex}`] = imagePath;
    jsonContent[`alt${newIndex}`] = alt || "";
    console.log("[POST] Updated JSON content with new image:", jsonContent);
    const updateJsonResult = await updateJsonFile(
      jsonFilePath,
      token,
      owner,
      repo,
      branch,
      jsonContent
    );
    console.log(
      "[POST] Updated JSON file after image upload:",
      updateJsonResult
    );

    return new NextResponse(
      JSON.stringify({ success: true, data: { uploadData, jsonContent } }),
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST] Server error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
