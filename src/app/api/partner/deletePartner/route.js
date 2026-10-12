import { Buffer } from "buffer";

export async function DELETE(req) {

  // Log headers
  const headersObj = {};
  for (const [name, value] of req.headers.entries()) headersObj[name] = value;

  try {
    // --- Auth & paths ---
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";

    const homepageFilePath = "src/data/homepage.json";
    const partnersFilePath = "src/data/products-and-partners.json";

    // --- Parse payload ---
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("[DELETE PARTNER] Invalid JSON body", err);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
      });
    }

    // Determine partner key and corresponding logo key
    let rawKey = body.key;
    const partnerKey =
      typeof rawKey === "object" && rawKey !== null ? rawKey.name : rawKey;
    if (!partnerKey || typeof partnerKey !== "string") {
      console.error("[DELETE PARTNER] Missing or invalid key field");
      return new Response(JSON.stringify({ error: "Missing or invalid key" }), {
        status: 400,
      });
    }

    // Construct logo key to match homepage partnerLogos entry
    const logoKey = partnerKey.startsWith("logo")
      ? partnerKey
      : `logo${partnerKey}`;

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
    if (!hpResp.ok) {
      const errorJson = await hpResp.json();
      console.error("[DELETE PARTNER] Cannot fetch homepage.json:", errorJson);
      return new Response(
        JSON.stringify({ error: "Cannot fetch homepage.json" }),
        { status: hpResp.status }
      );
    }
    const hpJson = await hpResp.json();
    const homepageSha = hpJson.sha;
    const homepage = JSON.parse(
      Buffer.from(hpJson.content, "base64").toString("utf8")
    );

    // --- Determine logo path ---
    const logoPath = homepage.partnerLogos?.[logoKey];
    if (!logoPath) {
      console.error(
        "[DELETE PARTNER] logoPath not found for logoKey:",
        logoKey
      );
      return new Response(
        JSON.stringify({ error: "Partner not found in homepage.json" }),
        { status: 404 }
      );
    }

    // --- Delete logo file ---
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
    if (logoInfoResp.ok) {
      const logoInfo = await logoInfoResp.json();
      const delLogoResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${logoRepoPath}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete logo ${logoKey}`,
            sha: logoInfo.sha,
            branch,
          }),
        }
      );
    } else {
      const errorJson = await logoInfoResp.json();
      console.error("[DELETE PARTNER] Cannot fetch logo info:", errorJson);
    }

    // --- Update homepage.json ---
    delete homepage.partnerLogos[logoKey];
    const hpUpdatedB64 = Buffer.from(
      JSON.stringify(homepage, null, 2)
    ).toString("base64");
    const hpUpdateResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Remove partner ${logoKey}`,
          content: hpUpdatedB64,
          sha: homepageSha,
          branch,
        }),
      }
    );

    // --- Fetch products-and-partners.json ---
    const ppResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (!ppResp.ok) {
      const errorJson = await ppResp.json();
      console.error("[DELETE PARTNER] Cannot fetch partners.json:", errorJson);
      return new Response(
        JSON.stringify({ error: "Cannot fetch partners.json" }),
        { status: ppResp.status }
      );
    }
    const ppJson = await ppResp.json();
    const partnersSha = ppJson.sha;
    const partnersData = JSON.parse(
      Buffer.from(ppJson.content, "base64").toString("utf8")
    );

    // --- Remove partner record & collect images ---
    let imagesToDelete = [];
    for (const k in partnersData.partners) {
      if (k === partnerKey) {
        imagesToDelete = partnersData.partners[k].images || [];
        delete partnersData.partners[k];
        break;
      }
    }

    // --- Delete each product image file ---
    for (const imgUrl of imagesToDelete) {
      const repoPath = `public${imgUrl}`;
      const infoResp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      if (infoResp.ok) {
        const infoJson = await infoResp.json();
        const delResp = await fetch(
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
      } else
        console.warn(`[DELETE PARTNER] No product image found at ${repoPath}`);
    }

    // --- Update products-and-partners.json ---
    const ppUpdatedB64 = Buffer.from(
      JSON.stringify(partnersData, null, 2)
    ).toString("base64");
    const ppUpdateResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Remove partner ${partnerKey}`,
          content: ppUpdatedB64,
          sha: partnersSha,
          branch,
        }),
      }
    );

    return new Response(
      JSON.stringify({ message: "Partner deleted", key: partnerKey }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE PARTNER] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
