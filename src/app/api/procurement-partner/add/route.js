/*  Add a new procurement‑partner logo
    – uploads the .webp image to /public/logos/
    – injects a `logoN` entry into products-and-partners.json
------------------------------------------------------------ */
import { Buffer } from "buffer";

export async function POST(req) {
  console.log("[ADD PP] received add‑procurement‑partner request");

  /* ───── env + constants ───── */
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO?.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const jsonPath = "src/data/products-and-partners.json";

  /* ───── multipart formdata ───── */
  const form = await req.formData();
  const file = form.get("file");
  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  if (file.type !== "image/webp")
    return Response.json({ error: "Only .webp allowed" }, { status: 400 });

  const bufBase64 = Buffer.from(await file.arrayBuffer())
    .toString("base64")
    .replace(/\n/g, "");

  /* ───── fetch current JSON ───── */
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
  const jsonObj = JSON.parse(
    Buffer.from(jsonData.content, "base64").toString("utf8")
  );

  if (
    !jsonObj.procurementPartners ||
    typeof jsonObj.procurementPartners !== "object"
  )
    jsonObj.procurementPartners = {};

  /* ───── next logo index ───── */
  const nums = Object.keys(jsonObj.procurementPartners)
    .map((k) => Number(k.replace("logo", "")))
    .filter((n) => !Number.isNaN(n));
  const idx = nums.length ? Math.max(...nums) + 1 : 1;

  /* filenames & repo path */
  const newFile = `procurementPartner${idx}.webp`;
  const imgPath = `/logos/${newFile}`;
  const repoPath = `public${imgPath}`;

  /* ───── upload image to GitHub ───── */
  const putImg = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload procurement‑partner logo ${newFile}`,
        content: bufBase64,
        branch,
      }),
    }
  );
  const putImgRes = await putImg.json();
  if (!putImg.ok)
    return Response.json(
      { error: "Image upload failed", details: putImgRes },
      { status: 500 }
    );

  /* ───── update JSON & push back ───── */
  jsonObj.procurementPartners[`logo${idx}`] = imgPath;
  const newJsonB64 = Buffer.from(JSON.stringify(jsonObj, null, 2)).toString(
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
        message: `Add procurement‑partner logo${idx}`,
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

  console.log("[ADD PP] success – logo", idx);
  return Response.json({ key: `logo${idx}`, imagePath: imgPath });
}
