import { Buffer } from "buffer";
import path from "path";

export async function POST(request, { params }) {
  try {
    // For career updates, we fix the page as "careers"
    const page = "careers";
    const filePath = `src/data/${page}.json`;

    // Get GitHub credentials and branch info
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";

    // Fetch current content file from GitHub
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getResponse.json();
    if (!getResponse.ok) {
      console.error("[CAREER UPDATE] Error fetching file info:", fileData);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve current content info",
          details: fileData,
        }),
        { status: 500 }
      );
    }

    const sha = fileData.sha;

    const currentContentString = Buffer.from(
      fileData.content,
      "base64"
    ).toString("utf8");
    const currentContent = JSON.parse(currentContentString);

    // Get update payload.
    // Expected payload: { career: { key: number, position, description, requirements, created_at } }
    const payload = await request.json();
    const updateCareer = payload.career;
    if (!updateCareer || updateCareer.key === undefined) {
      console.error(
        "[CAREER UPDATE] Career data with key is required. Received:",
        updateCareer
      );
      return new Response(
        JSON.stringify({ error: "Career data with key is required" }),
        { status: 400 }
      );
    }

    // Ensure the careers array exists
    if (!currentContent.careers || !Array.isArray(currentContent.careers)) {
      console.error("[CAREER UPDATE] Careers array not found in JSON.");
      return new Response(
        JSON.stringify({ error: "Careers array not found" }),
        { status: 404 }
      );
    }

    // Find the index of the career with the given key
    const index = currentContent.careers.findIndex(
      (item) => item.key === updateCareer.key
    );
    if (index === -1) {
      console.error(
        "[CAREER UPDATE] Career with key",
        updateCareer.key,
        "not found"
      );
      return new Response(
        JSON.stringify({ error: "Career with given key not found" }),
        { status: 404 }
      );
    }

    // Merge the update into the existing career (shallow merge)
    const mergedCareer = { ...currentContent.careers[index], ...updateCareer };
    currentContent.careers[index] = mergedCareer;

    // Prepare updated content to push to GitHub
    const contentString = JSON.stringify(currentContent, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // Prepare PUT request payload
    const putBody = {
      message: `Update career entry with key ${updateCareer.key}`,
      content: contentBase64,
      sha,
      branch,
    };

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

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
    if (!putResponse.ok) {
      console.error("[CAREER UPDATE] Error updating file:", updateResponseData);
      return new Response(
        JSON.stringify({
          error: "Failed to update career content on GitHub",
          details: updateResponseData,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, career: mergedCareer }),
      { status: 200 }
    );
  } catch (err) {
    console.error("[CAREER UPDATE] Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
