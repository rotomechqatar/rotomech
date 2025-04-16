import { Buffer } from "buffer";

export async function POST(req) {
  console.log("[ADD PARTNER] Received add partner request");

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  const homepageFilePath = "src/data/homepage.json";
  const partnersFilePath = "src/data/products-and-partners.json";

  // Fetch homepage.json
  const hpResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const hpJson = await hpResp.json();
  if (!hpResp.ok) {
    console.error("[ADD PARTNER] Error fetching homepage.json:", hpJson);
    return new Response(
      JSON.stringify({ error: "Cannot fetch homepage.json" }),
      { status: 500 }
    );
  }
  const homepageSha = hpJson.sha;
  const homepage = JSON.parse(
    Buffer.from(hpJson.content, "base64").toString("utf8")
  );

  // Fetch products-and-partners.json
  const ppResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const ppJson = await ppResp.json();
  if (!ppResp.ok) {
    console.error("[ADD PARTNER] Error fetching partners.json:", ppJson);
    return new Response(
      JSON.stringify({ error: "Cannot fetch partners.json" }),
      { status: 500 }
    );
  }
  const partnersSha = ppJson.sha;
  const partnersData = JSON.parse(
    Buffer.from(ppJson.content, "base64").toString("utf8")
  );

  // Parse form data
  const form = await req.formData();
  const name = form.get("name");
  const description = form.get("description");
  const logoFile = form.get("file");
  const productFiles = form.getAll("productImages");

  console.log(
    "[ADD PARTNER] name, description, logoFile, #productImages:",
    name,
    description,
    logoFile?.name,
    productFiles.length
  );

  if (!name || !description || !logoFile || productFiles.length === 0) {
    return new Response(
      JSON.stringify({ error: "Missing fields or no product images" }),
      { status: 400 }
    );
  }
  if (
    logoFile.type !== "image/webp" ||
    productFiles.some((f) => f.type !== "image/webp")
  ) {
    return new Response(JSON.stringify({ error: "Only .webp allowed" }), {
      status: 400,
    });
  }

  // Upload partner logo
  const partnerLogos = homepage.partnerLogos || {};
  let idx = 1;
  while (partnerLogos[`logo${idx}`]) idx++;
  const logoFilename = `partnerLogo${idx}.webp`;
  const logoPath = `/logos/${logoFilename}`;
  const logoRepoPath = `public/logos/${logoFilename}`;
  const logoB64 = Buffer.from(await logoFile.arrayBuffer()).toString("base64");

  console.log("[ADD PARTNER] uploading logo:", logoRepoPath);
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${logoRepoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload ${logoFilename}`,
        content: logoB64,
        branch,
      }),
    }
  );

  // Update homepage.json
  homepage.partnerLogos = homepage.partnerLogos || {};
  homepage.partnerLogos[`logo${idx}`] = logoPath;
  const hpUpdatedB64 = Buffer.from(JSON.stringify(homepage, null, 2)).toString(
    "base64"
  );
  console.log("[ADD PARTNER] updating homepage.json");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add partnerLogo${idx}`,
        content: hpUpdatedB64,
        sha: homepageSha,
        branch,
      }),
    }
  );

  // Prepare product images
  const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const baseName = sanitize(name);
  const imageUrls = [];

  for (let i = 0; i < productFiles.length; i++) {
    const pf = productFiles[i];
    const num = i + 1;
    const imgFilename = `${baseName}${num}.webp`;
    const imgPath = `/images/products/${imgFilename}`;
    const imgRepoPath = `public/images/products/${imgFilename}`;
    const imgB64 = Buffer.from(await pf.arrayBuffer()).toString("base64");

    console.log("[ADD PARTNER] uploading product image:", imgRepoPath);
    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${imgRepoPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload ${imgFilename}`,
          content: imgB64,
          branch,
        }),
      }
    );

    imageUrls.push(imgPath);
  }

  // Update products-and-partners.json
  partnersData.partners = partnersData.partners || {};
  const nextKey = (
    Math.max(...Object.keys(partnersData.partners).map((k) => +k), 0) + 1
  ).toString();
  partnersData.partners[nextKey] = {
    name,
    logo: logoPath,
    description,
    images: imageUrls,
  };

  const ppUpdatedB64 = Buffer.from(
    JSON.stringify(partnersData, null, 2)
  ).toString("base64");
  console.log("[ADD PARTNER] updating products-and-partners.json");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add partner ${name}`,
        content: ppUpdatedB64,
        sha: partnersSha,
        branch,
      }),
    }
  );

  return new Response(
    JSON.stringify({
      message: "Partner added",
      key: `logo${idx}`,
      logo: logoPath,
      images: imageUrls,
    }),
    { status: 200 }
  );
}
