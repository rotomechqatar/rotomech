import { Buffer } from "buffer";

export async function POST(request) {
  try {
    // Expecting JSON with { filename, fileData } where fileData is a Base64 string (without data URI prefix)
    const { filename, fileData } = await request.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    const filePath = `public/images/${filename}`;

    // Create a new file on GitHub
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
          message: `Upload image ${filename} via admin panel`,
          content: fileData, // should be base64-encoded already
          branch,
        }),
      }
    );

    const responseData = await putResponse.json();
    if (!putResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to upload image",
          details: responseData,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
