import { Buffer } from "buffer";
import path from "path";

export async function POST(request, { params }) {
  try {
    // For creating careers, we fix the page as "careers"
    const page = "careers";
    const filePath = `src/data/${page}.json`;
    console.log("[CAREER CREATE] Creating a new career entry for page:", page);
    console.log("[CAREER CREATE] File path:", filePath);

    // Get GitHub credentials and branch info
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log(
      "[CAREER CREATE] Using branch:",
      branch,
      "Owner:",
      owner,
      "Repo:",
      repo
    );

    // Fetch current careers JSON file from GitHub
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    console.log("[CAREER CREATE] Fetching current file from URL:", getUrl);
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getResponse.json();
    if (!getResponse.ok) {
      console.error("[CAREER CREATE] Error fetching file info:", fileData);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve current career content",
          details: fileData,
        }),
        { status: 500 }
      );
    }
    const sha = fileData.sha;
    console.log("[CAREER CREATE] Retrieved SHA:", sha);

    const currentContentString = Buffer.from(
      fileData.content,
      "base64"
    ).toString("utf8");
    console.log("[CAREER CREATE] Decoded file content:", currentContentString);
    let currentContent = JSON.parse(currentContentString);
    console.log("[CAREER CREATE] Parsed current content:", currentContent);

    // Get the new career payload.
    // Expected payload: { career: { position, description, requirements, created_at } }
    const payload = await request.json();
    console.log("[CAREER CREATE] Received payload:", payload);
    const newCareer = payload.career;
    if (!newCareer || !newCareer.position) {
      return new Response(
        JSON.stringify({
          error: "Career data with at least a position is required",
        }),
        { status: 400 }
      );
    }

    // Ensure the careers array exists; if not, initialize it.
    if (!currentContent.careers || !Array.isArray(currentContent.careers)) {
      console.log(
        "[CAREER CREATE] No careers array found. Initializing new array."
      );
      currentContent.careers = [];
    }

    // Determine the new key by finding the maximum existing key and adding 1.
    let newKey = 1;
    if (currentContent.careers.length > 0) {
      const keys = currentContent.careers.map((item) => item.key);
      newKey = Math.max(...keys) + 1;
    }
    newCareer.key = newKey;
    console.log("[CAREER CREATE] Assigned new key:", newKey);

    // Append the new career to the careers array.
    currentContent.careers.push(newCareer);
    console.log(
      "[CAREER CREATE] New career appended. Updated content:",
      currentContent
    );

    // Prepare updated content to push to GitHub.
    const contentString = JSON.stringify(currentContent, null, 2);
    console.log("[CAREER CREATE] Final content string:", contentString);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // Prepare the PUT request payload.
    const putBody = {
      message: `Create new career entry with key ${newKey}`,
      content: contentBase64,
      sha,
      branch,
    };
    console.log("[CAREER CREATE] PUT payload:", putBody);

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    console.log("[CAREER CREATE] Updating file on GitHub with URL:", putUrl);

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
    console.log(
      "[CAREER CREATE] Response from GitHub on update:",
      updateResponseData
    );
    if (!putResponse.ok) {
      console.error("[CAREER CREATE] Error updating file:", updateResponseData);
      return new Response(
        JSON.stringify({
          error: "Failed to create new career entry on GitHub",
          details: updateResponseData,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, career: newCareer }), {
      status: 200,
    });
  } catch (err) {
    console.error("[CAREER CREATE] Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
