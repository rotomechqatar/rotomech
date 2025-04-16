import { Buffer } from "buffer";

export async function DELETE(req) {
  console.log("[DELETE PARTNER] Received delete partner request");

  // --- Auth & paths ---
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";
  const homepageFilePath = "src/data/homepage.json";
  const partnersFilePath = "src/data/products-and-partners.json";

  // --- Parse payload ---
  let body;
  try {
    body = await req.json();
    console.log("[DELETE PARTNER] payload:", body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  // Unwrap key if it was passed as an object
  let rawKey = body.key;
  const key =
    typeof rawKey === "object" && rawKey !== null ? rawKey.name : rawKey;
  if (!key || typeof key !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid key" }), {
      status: 400,
    });
  }
  console.log("[DELETE PARTNER] Removing partner with key:", key);

  // --- Fetch homepage.json ---
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
    console.error("[DELETE PARTNER] Cannot fetch homepage.json:", hpJson);
    return new Response(
      JSON.stringify({ error: "Cannot fetch homepage.json" }),
      { status: 500 }
    );
  }
  const homepageSha = hpJson.sha;
  const homepage = JSON.parse(
    Buffer.from(hpJson.content, "base64").toString("utf8")
  );

  // --- Find & delete logo file ---
  const logoPath = homepage.partnerLogos?.[key];
  if (!logoPath) {
    console.error("[DELETE PARTNER] logoPath not found for key:", key);
    return new Response(JSON.stringify({ error: "Partner not found" }), {
      status: 404,
    });
  }
  console.log("[DELETE PARTNER] Deleting logo at:", logoPath);
  const logoRepoPath = `public${logoPath}`;
  const logoInfoResp = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${logoRepoPath}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const logoInfo = await logoInfoResp.json();
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${logoRepoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete ${key}`,
        sha: logoInfo.sha,
        branch,
      }),
    }
  );

  // --- Remove entry from homepage.json ---
  delete homepage.partnerLogos[key];
  const hpUpdatedB64 = Buffer.from(JSON.stringify(homepage, null, 2)).toString(
    "base64"
  );
  console.log("[DELETE PARTNER] updating homepage.json");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Remove ${key}`,
        content: hpUpdatedB64,
        sha: homepageSha,
        branch,
      }),
    }
  );

  // --- Fetch & parse products-and-partners.json ---
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
    console.error("[DELETE PARTNER] Cannot fetch partners.json:", ppJson);
    return new Response(
      JSON.stringify({ error: "Cannot fetch partners.json" }),
      { status: 500 }
    );
  }
  const partnersSha = ppJson.sha;
  const partnersData = JSON.parse(
    Buffer.from(ppJson.content, "base64").toString("utf8")
  );

  // --- Remove partner record & collect product images to delete ---
  let imagesToDelete = [];
  for (const k in partnersData.partners) {
    if (partnersData.partners[k].logo === logoPath) {
      imagesToDelete = partnersData.partners[k].images || [];
      delete partnersData.partners[k];
      console.log(
        "[DELETE PARTNER] removed data for partners.partners[",
        k,
        "]"
      );
      break;
    }
  }

  // --- Delete each product image file ---
  for (const imgUrl of imagesToDelete) {
    const repoPath = `public${imgUrl}`;
    console.log("[DELETE PARTNER] deleting product image:", repoPath);
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
    if (infoResp.ok) {
      await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete product image`,
            sha: infoJson.sha,
            branch,
          }),
        }
      );
    }
  }

  // --- Update products-and-partners.json with the partner removed ---
  const ppUpdatedB64 = Buffer.from(
    JSON.stringify(partnersData, null, 2)
  ).toString("base64");
  console.log("[DELETE PARTNER] updating products-and-partners.json");
  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Remove partner ${key}`,
        content: ppUpdatedB64,
        sha: partnersSha,
        branch,
      }),
    }
  );

  return new Response(JSON.stringify({ message: "Partner deleted", key }), {
    status: 200,
  });
}
