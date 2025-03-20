// app/api/updateContent/route.js
import { Buffer } from "buffer";

export async function POST(request) {
  try {
    const { title, description } = await request.json();
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH;
    const filePath = "src/data/homePageContent.json";

    // 1. Get the current file info from GitHub to retrieve the SHA
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (!getResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve current content info" }),
        { status: 500 }
      );
    }
    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // 2. Prepare the new content
    const newContent = { title, description };
    const contentString = JSON.stringify(newContent, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // 3. Update the file on GitHub
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
          message: "Update content via admin panel",
          content: contentBase64,
          sha,
          branch,
        }),
      }
    );

    if (!putResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to update content on GitHub" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
