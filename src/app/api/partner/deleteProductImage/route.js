import { Buffer } from "buffer";

export async function DELETE(req) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO.split("/").pop();
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const { partnerKey, imagePath } = await req.json();
  if (!partnerKey || !imagePath) {
    return new Response(
      JSON.stringify({ error: "Missing partnerKey or imagePath" }),
      { status: 400 }
    );
  }

  const path = "src/data/products-and-partners.json";
  // fetch JSON
  const metaUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const metaJson = await metaRes.json();
  const sha = metaJson.sha;
  const json = JSON.parse(
    Buffer.from(metaJson.content, "base64").toString("utf8")
  );

  // delete file on disk
  const repoPath = imagePath.startsWith("/") ? "public" + imagePath : imagePath;
  const infoRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const infoJson = await infoRes.json();
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete ${repoPath}`,
        sha: infoJson.sha,
        branch,
      }),
    }
  );

  // remove from JSON
  const arr = json.partners[partnerKey].images;
  json.partners[partnerKey].images = arr.filter((i) => i !== imagePath);

  // push updated JSON
  const updated = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Remove image from partner ${partnerKey}`,
        content: updated,
        sha,
        branch,
      }),
    }
  );

  return new Response(JSON.stringify({ partnerKey }), { status: 200 });
}
