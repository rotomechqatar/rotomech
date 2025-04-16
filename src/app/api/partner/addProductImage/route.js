import { Buffer } from "buffer";

export async function POST(req) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO.split("/").pop();
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const form = await req.formData();
  const key = form.get("partnerKey");
  const file = form.get("file");
  if (!key || !file) {
    return new Response(
      JSON.stringify({ error: "Missing partnerKey or file" }),
      { status: 400 }
    );
  }

  // Fetch partners JSON
  const path = "src/data/products-and-partners.json";
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

  // compute next image filename
  const partner = json.partners[key];
  const base = partner.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const idx = (partner.images || []).length + 1;
  const fname = `${base}${idx}.webp`;
  const repoPath = `public/images/products/${fname}`;
  const webPath = `/images/products/${fname}`;

  // upload file
  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add product image ${fname}`,
        content: b64,
        branch,
      }),
    }
  );

  // update JSON
  partner.images = partner.images || [];
  partner.images.push(webPath);
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
        message: `Add image to partner ${key}`,
        content: updated,
        sha,
        branch,
      }),
    }
  );

  return new Response(JSON.stringify({ partnerKey: key, imagePath: webPath }), {
    status: 200,
  });
}
