import { NextResponse } from "next/server";
import { Buffer } from "buffer";

// Helper: update the JSON file on GitHub after modification
async function updateJsonFile(
  filePath,
  token,
  owner,
  repo,
  branch,
  newContent
) {
  console.log("[updateJsonFile] Fetching current JSON from:", filePath);
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getRes.json();
  console.log("[updateJsonFile] Received fileData:", fileData);
  const sha = fileData.sha;
  const contentString = JSON.stringify(newContent, null, 2);
  const contentBase64 = Buffer.from(contentString).toString("base64");

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  console.log("[updateJsonFile] PUT URL:", putUrl);
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Update JSON file after image deletion`,
      content: contentBase64,
      sha,
      branch,
    }),
  });
  const putData = await putRes.json();
  console.log("[updateJsonFile] Updated JSON response:", putData);
  return putData;
}

export async function DELETE(request, { params }) {
  console.log("[DELETE] Starting DELETE endpoint");
  try {
    const body = await request.json();
    console.log("[DELETE] Received request body:", body);
    const { filename } = body;
    const page = params.page; // dynamic parameter from URL
    console.log("[DELETE] params.page:", page);

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log("[DELETE] Using token, owner, repo, branch:", {
      token: !!token,
      owner,
      repo,
      branch,
    });

    // Delete the image file from repository
    const imagePath = `public/images/${filename}`;
    console.log("[DELETE] Deleting image file at:", imagePath);

    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}?ref=${branch}`;
    console.log("[DELETE] GET URL for image info:", getUrl);
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getRes.json();
    console.log("[DELETE] File data received:", fileData);

    if (!getRes.ok) {
      console.error("[DELETE] Error fetching image file info:", fileData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to retrieve image info",
          details: fileData,
        }),
        { status: 500 }
      );
    }

    const sha = fileData.sha;
    console.log("[DELETE] Retrieved sha:", sha);

    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`;
    console.log("[DELETE] DELETE URL for image:", deleteUrl);
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete image ${filename} from public/images via admin panel`,
        sha,
        branch,
      }),
    });
    const deleteData = await deleteRes.json();
    console.log("[DELETE] Response from DELETE call:", deleteData);
    if (!deleteRes.ok) {
      console.error("[DELETE] Error deleting image file:", deleteData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to delete image",
          details: deleteData,
        }),
        { status: 500 }
      );
    }
    console.log("[DELETE] Image file deleted successfully");

    // Update the JSON file: remove keys for this image.
    const jsonFilePath = `src/data/${page}.json`;
    console.log("[DELETE] JSON file path:", jsonFilePath);
    const jsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
    console.log("[DELETE] GET URL for JSON file:", jsonUrl);
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
    console.log("[DELETE] Current JSON content:", jsonContent);

    // Remove keys whose value contains the filename (for example "image2" and "alt2")
    let removed = false;
    for (const key in jsonContent) {
      if (
        (key.startsWith("image") || key.startsWith("alt")) &&
        jsonContent[key].includes(filename)
      ) {
        console.log(
          `[DELETE] Removing key ${key} with value:`,
          jsonContent[key]
        );
        delete jsonContent[key];
        removed = true;
      }
    }
    if (removed) {
      console.log("[DELETE] Updating JSON file with removed keys...");
      const updateJsonResult = await updateJsonFile(
        jsonFilePath,
        token,
        owner,
        repo,
        branch,
        jsonContent
      );
      console.log(
        "[DELETE] Updated JSON file after image deletion:",
        updateJsonResult
      );
    } else {
      console.log(
        "[DELETE] No matching keys found in JSON for filename:",
        filename
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true, data: deleteData }),
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE] Server error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
