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
      message: `Update JSON file after deleting image`,
      content: contentBase64,
      sha,
      branch,
    }),
  });
  return await putRes.json();
}

export async function DELETE(request, { params }) {
  try {
    const { filename } = await request.json();
    const page = params.page; // dynamic parameter from URL
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";

    // Delete the image file from repository
    const imagePath = `public/images/${page}/${filename}`;
    console.log("Deleting image file at:", imagePath);
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getRes.json();
    if (!getRes.ok) {
      console.error("Error fetching image file info:", fileData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to retrieve image info",
          details: fileData,
        }),
        { status: 500 }
      );
    }
    const sha = fileData.sha;
    const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`;
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete image ${filename} from ${page} via admin panel`,
        sha,
        branch,
      }),
    });
    const deleteData = await deleteRes.json();
    if (!deleteRes.ok) {
      console.error("Error deleting image file:", deleteData);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to delete image",
          details: deleteData,
        }),
        { status: 500 }
      );
    }
    console.log("Image file deleted successfully:", deleteData);

    // Update the JSON file: remove keys for this image.
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

    // Remove keys whose value contains the filename (for example "image2" and "alt2")
    let removed = false;
    for (const key in jsonContent) {
      if (
        (key.startsWith("image") || key.startsWith("alt")) &&
        jsonContent[key].includes(filename)
      ) {
        console.log(`Removing key ${key} with value ${jsonContent[key]}`);
        delete jsonContent[key];
        removed = true;
      }
    }
    if (removed) {
      const updateJsonResult = await updateJsonFile(
        jsonFilePath,
        token,
        owner,
        repo,
        branch,
        jsonContent
      );
      console.log("Updated JSON file after image deletion:", updateJsonResult);
    } else {
      console.log("No matching keys found in JSON for filename:", filename);
    }

    return new NextResponse(
      JSON.stringify({ success: true, data: deleteData }),
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
