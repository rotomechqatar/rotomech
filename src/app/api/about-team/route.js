import { Buffer } from "buffer";

export async function POST(req) {
  console.log("[ABOUT-TEAM] Received image replace request");
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  // parse form data
  const form = await req.formData();
  const field = form.get("field"); // "director" or "teamImage"
  const file = form.get("file");
  if (!field || !file) {
    return new Response(JSON.stringify({ error: "Missing field or file" }), {
      status: 400,
    });
  }

  // Map field → JSON image path
  // These must exactly match what's in your about-us JSON
  const jsonPath = "src/data/about-us.json";
  const fileMap = {
    director: "/images/director-image.jpg",
    teamImage: "/images/team-image.jpg",
  };
  const imagePath = fileMap[field];
  if (!imagePath) {
    return new Response(JSON.stringify({ error: "Unknown field" }), {
      status: 400,
    });
  }
  const repoPath = imagePath.startsWith("/") ? "public" + imagePath : imagePath;

  // 1) Fetch the file SHA so we can delete it
  const infoResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const infoJson = await infoResp.json();
  if (!infoResp.ok) {
    console.error("[ABOUT-TEAM] Error fetching file info:", infoJson);
    return new Response(
      JSON.stringify({ error: "Cannot fetch existing image info" }),
      { status: 500 }
    );
  }

  // 2) Delete the old image
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Replace ${field} image`,
        sha: infoJson.sha,
        branch,
      }),
    }
  );

  // 3) Upload the new image with the same repoPath
  const buffer = Buffer.from(await file.arrayBuffer());
  const b64 = buffer.toString("base64");
  const putResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload new ${field} image`,
        content: b64,
        branch,
      }),
    }
  );
  const putJson = await putResp.json();
  if (!putResp.ok) {
    console.error("[ABOUT-TEAM] Error uploading new image:", putJson);
    return new Response(
      JSON.stringify({ error: "Failed to upload new image" }),
      { status: 500 }
    );
  }

  console.log("[ABOUT-TEAM] Image replaced successfully at", imagePath);
  return new Response(JSON.stringify({ imagePath }), { status: 200 });
}
