import { Buffer } from "buffer";

// A simple deep merge helper that recursively merges two objects.
function deepMerge(target, source) {
  // If either target or source is not an object, return source.
  if (typeof target !== "object" || target === null) {
    return source;
  }
  if (typeof source !== "object" || source === null) {
    return source;
  }
  // Merge each key in source
  const merged = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // Recursively merge if both have objects at this key
      merged[key] = deepMerge(target[key], source[key]);
    }
  }
  return merged;
}

export async function POST(request, { params }) {
  try {
    // Get the page identifier from the URL
    const page = params.page;
    const filePath = `src/data/${page}.json`;

    // Get the update payload (could be partial)
    const updateData = await request.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";

    // Retrieve the current file info from GitHub to get the SHA and current content
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    const fileData = await getResponse.json();
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
    // GitHub returns file content in base64 encoding – decode it first.
    const currentContent = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf8")
    );

    // Deep merge the incoming updateData into the existing content
    const mergedContent = deepMerge(currentContent, updateData);
    const contentString = JSON.stringify(mergedContent, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // Update the file on GitHub using a PUT request
    const putResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update ${page} content via admin panel`,
          content: contentBase64,
          sha,
          branch,
        }),
      }
    );
    const updateResponseData = await putResponse.json();
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
