/*  Delete a procurement‑partner logo
    – removes the image file from GitHub
    – deletes the entry from products-and-partners.json
------------------------------------------------------------ */
import { Buffer } from "buffer";

export async function DELETE(req) {
  console.log("[DEL PP] received delete‑procurement‑partner request");

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO?.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const jsonPath = "src/data/products-and-partners.json";

  const { key } = await req.json();
  if (!key) return Response.json({ error: "Missing key" }, { status: 400 });

  /* ───── fetch JSON first ───── */
  const jsonURL = `https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`;
  const jsonResp = await fetch(jsonURL, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const jsonData = await jsonResp.json();
  if (!jsonResp.ok)
    return Response.json(
      { error: "Cannot fetch JSON", details: jsonData },
      { status: 500 }
    );

  const jsonSha = jsonData.sha;
  const obj = JSON.parse(
    Buffer.from(jsonData.content, "base64").toString("utf8")
  );

  const logoPath = obj.procurementPartners?.[key];
  if (!logoPath)
    return Response.json({ error: "Key not found" }, { status: 404 });

  /* ───── delete image file (need its SHA) ───── */
  const repoPath = `public${logoPath}`;
  const imgInfo = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const imgData = await imgInfo.json();
  if (!imgInfo.ok)
    return Response.json(
      { error: "Cannot fetch image info", details: imgData },
      { status: 500 }
    );

  const delImg = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete procurement‑partner ${key}`,
        sha: imgData.sha,
        branch,
      }),
    }
  );
  const delImgRes = await delImg.json();
  if (!delImg.ok)
    return Response.json(
      { error: "Image delete failed", details: delImgRes },
      { status: 500 }
    );

  /* ───── remove key & push JSON ───── */
  delete obj.procurementPartners[key];
  const newJsonB64 = Buffer.from(JSON.stringify(obj, null, 2)).toString(
    "base64"
  );

  const putJson = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Remove procurement‑partner ${key}`,
        content: newJsonB64,
        sha: jsonSha,
        branch,
      }),
    }
  );
  const putJsonRes = await putJson.json();
  if (!putJson.ok)
    return Response.json(
      { error: "JSON update failed", details: putJsonRes },
      { status: 500 }
    );

  console.log("[DEL PP] success – removed", key);
  return Response.json({ success: true });
}
