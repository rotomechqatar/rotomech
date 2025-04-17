import { Buffer } from "buffer";

export async function DELETE(req) {
  console.log("[DELETE PARTNER] Received delete partner request");
  console.log("[DELETE PARTNER] Request URL:", req.url, "Method:", req.method);

  // Log headers
  const headersObj = {};
  for (const [name, value] of req.headers.entries()) headersObj[name] = value;
  console.log("[DELETE PARTNER] Request headers:", headersObj);

  try {
    // --- Auth & paths ---
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log(
      `[DELETE PARTNER] Git context -> owner: ${owner}, repo: ${repo}, branch: ${branch}`
    );

    const homepageFilePath = "src/data/homepage.json";
    const partnersFilePath = "src/data/products-and-partners.json";

    // --- Parse payload ---
    let body;
    try {
      body = await req.json();
      console.log("[DELETE PARTNER] Request body:", body);
    } catch (err) {
      console.error("[DELETE PARTNER] Invalid JSON body", err);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
      });
    }

    // Determine partner key and corresponding logo key
    let rawKey = body.key;
    console.log("[DELETE PARTNER] rawKey:", rawKey);
    const partnerKey =
      typeof rawKey === "object" && rawKey !== null ? rawKey.name : rawKey;
    console.log("[DELETE PARTNER] parsed partnerKey:", partnerKey);
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
    console.log("[DELETE PARTNER] derived logoKey:", logoKey);

    // --- Fetch homepage.json ---
    console.log("[DELETE PARTNER] Fetching homepage.json from GitHub");
    const hpResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log(
      `[DELETE PARTNER] homepage.json fetch status: ${hpResp.status}`
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
    console.log("[DELETE PARTNER] Parsed homepage object:", homepage);

    // --- Determine logo path ---
    console.log(
      "[DELETE PARTNER] homepage.partnerLogos keys:",
      Object.keys(homepage.partnerLogos || {})
    );
    const logoPath = homepage.partnerLogos?.[logoKey];
    console.log(
      "[DELETE PARTNER] logoPath for logoKey:",
      logoKey,
      "->",
      logoPath
    );
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
    console.log("[DELETE PARTNER] Deleting logo at repo path:", logoRepoPath);
    const logoInfoResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${logoRepoPath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log(
      `[DELETE PARTNER] logoInfo fetch status: ${logoInfoResp.status}`
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
      console.log(
        `[DELETE PARTNER] Logo delete response: ${delLogoResp.status}`
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
    console.log("[DELETE PARTNER] Updating homepage.json, removed:", logoKey);
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
    console.log(
      `[DELETE PARTNER] homepage.json update status: ${hpUpdateResp.status}`
    );

    // --- Fetch products-and-partners.json ---
    console.log("[DELETE PARTNER] Fetching products-and-partners.json");
    const ppResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log(
      `[DELETE PARTNER] partners.json fetch status: ${ppResp.status}`
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
    console.log("[DELETE PARTNER] Parsed partnersData:", partnersData);

    // --- Remove partner record & collect images ---
    let imagesToDelete = [];
    for (const k in partnersData.partners) {
      if (k === partnerKey) {
        imagesToDelete = partnersData.partners[k].images || [];
        delete partnersData.partners[k];
        console.log(
          `[DELETE PARTNER] Removed partnersData entry for key: ${k}`
        );
        break;
      }
    }

    // --- Delete each product image file ---
    for (const imgUrl of imagesToDelete) {
      const repoPath = `public${imgUrl}`;
      console.log("[DELETE PARTNER] Deleting product image:", repoPath);
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
        console.log(
          `[DELETE PARTNER] Product image delete status: ${delResp.status}`
        );
      } else
        console.warn(`[DELETE PARTNER] No product image found at ${repoPath}`);
    }

    // --- Update products-and-partners.json ---
    const ppUpdatedB64 = Buffer.from(
      JSON.stringify(partnersData, null, 2)
    ).toString("base64");
    console.log("[DELETE PARTNER] Updating partners.json after deletion");
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
    console.log(
      `[DELETE PARTNER] partners.json update status: ${ppUpdateResp.status}`
    );

    console.log(
      "[DELETE PARTNER] Completed deletion for partnerKey:",
      partnerKey
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
