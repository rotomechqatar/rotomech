import { Buffer } from "buffer";
import path from "path";

export async function POST(request, { params }) {
  try {
    // For career deletion, we fix the page as "careers"
    const page = "careers";
    const filePath = `src/data/${page}.json`;
    console.log("[CAREER DELETE] Deleting career entry from page:", page);
    console.log("[CAREER DELETE] File path:", filePath);

    // Get GitHub credentials and branch info
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log(
      "[CAREER DELETE] Using branch:",
      branch,
      "Owner:",
      owner,
      "Repo:",
      repo
    );

    // Fetch current content file from GitHub
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    console.log("[CAREER DELETE] Fetching current file from URL:", getUrl);
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getResponse.json();
    if (!getResponse.ok) {
      console.error("[CAREER DELETE] Error fetching file info:", fileData);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve current career content",
          details: fileData,
        }),
        { status: 500 }
      );
    }
    const sha = fileData.sha;
    console.log("[CAREER DELETE] Retrieved SHA:", sha);
    const currentContentString = Buffer.from(
      fileData.content,
      "base64"
    ).toString("utf8");
    const currentContent = JSON.parse(currentContentString);
    console.log("[CAREER DELETE] Parsed current content:", currentContent);

    // Get delete payload. Expected payload: { key: number }
    const payload = await request.json();
    console.log("[CAREER DELETE] Received payload:", payload);
    const careerKey = payload.key;
    if (careerKey === undefined) {
      return new Response(JSON.stringify({ error: "Career key is required" }), {
        status: 400,
      });
    }

    // Ensure the careers array exists
    if (!currentContent.careers || !Array.isArray(currentContent.careers)) {
      return new Response(
        JSON.stringify({ error: "Careers array not found" }),
        { status: 404 }
      );
    }

    // Filter out the career with the given key
    const originalLength = currentContent.careers.length;
    currentContent.careers = currentContent.careers.filter(
      (item) => item.key !== careerKey
    );
    if (currentContent.careers.length === originalLength) {
      return new Response(
        JSON.stringify({ error: "Career with given key not found" }),
        { status: 404 }
      );
    }
    console.log(
      "[CAREER DELETE] Updated careers array:",
      currentContent.careers
    );

    // Prepare updated content to push to GitHub
    const contentString = JSON.stringify(currentContent, null, 2);
    console.log("[CAREER DELETE] Final content string:", contentString);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // Prepare PUT request payload
    const putBody = {
      message: `Delete career entry with key ${careerKey}`,
      content: contentBase64,
      sha,
      branch,
    };
    console.log("[CAREER DELETE] PUT payload:", putBody);

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    console.log("[CAREER DELETE] Updating file on GitHub with URL:", putUrl);

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
      "[CAREER DELETE] Response from GitHub on update:",
      updateResponseData
    );
    if (!putResponse.ok) {
      console.error("[CAREER DELETE] Error updating file:", updateResponseData);
      return new Response(
        JSON.stringify({
          error: "Failed to update career content on GitHub",
          details: updateResponseData,
        }),
        { status: 500 }
      );
    }

    console.log(
      "[CAREER DELETE] Career entry with key",
      careerKey,
      "deleted successfully."
    );
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("[CAREER DELETE] Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
