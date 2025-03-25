import { Buffer } from "buffer";
import path from "path";

// Deep merge helper that recursively merges two objects.
function deepMerge(target, source) {
  if (typeof target !== "object" || target === null) {
    return source;
  }
  if (typeof source !== "object" || source === null) {
    return source;
  }
  const merged = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      merged[key] = deepMerge(target[key], source[key]);
    }
  }
  return merged;
}

export async function POST(request, { params }) {
  try {
    console.log("POST updateContent called with params:", params);
    // Await the dynamic parameter value as requested.
    const param = await params;
    const page = param.page;
    console.log("Page parameter:", page);

    const filePath = `src/data/${page}.json`;
    console.log("Using file path:", filePath);

    // Get update payload (could be partial)
    const updatePayload = await request.json();
    console.log("Received update payload:", updatePayload);

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log("Using branch:", branch);
    console.log("Owner:", owner, "Repo:", repo);

    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    console.log("Fetching current file from GitHub using URL:", getUrl);

    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getResponse.json();
    console.log("Response from GitHub for current file:", fileData);

    if (!getResponse.ok) {
      console.error("Error fetching file info:", fileData);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve current content info",
          details: fileData,
        }),
        { status: 500 }
      );
    }

    const sha = fileData.sha;
    console.log("Retrieved SHA:", sha);

    // Decode current file content (GitHub returns content in base64)
    const currentContentString = Buffer.from(
      fileData.content,
      "base64"
    ).toString("utf8");
    console.log("Current file content string:", currentContentString);
    const currentContent = JSON.parse(currentContentString);
    console.log("Parsed current content:", currentContent);

    // Deep merge the incoming updatePayload into the existing content
    const mergedContent = deepMerge(currentContent, updatePayload);
    console.log("Merged content:", mergedContent);

    const contentString = JSON.stringify(mergedContent, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");
    console.log("Final content string to be uploaded:", contentString);

    // Prepare PUT request payload
    const putBody = {
      message: `Update ${page} content via admin panel`,
      content: contentBase64,
      sha,
      branch,
    };

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    console.log("Updating file on GitHub with URL:", putUrl);
    console.log("PUT request payload:", putBody);

    const putResponse = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    });
    const updateResponseData = await putResponse.json();
    console.log("Response from GitHub on update:", updateResponseData);

    if (!putResponse.ok) {
      console.error("Error updating file:", updateResponseData);
      return new Response(
        JSON.stringify({
          error: "Failed to update content on GitHub",
          details: updateResponseData,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, content: mergedContent }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
