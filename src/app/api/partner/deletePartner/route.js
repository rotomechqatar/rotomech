import { Buffer } from "buffer";

export async function DELETE(req) {
  console.log("[DELETE PARTNER] Received delete partner request");

  // Environment variables for GitHub API
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";
  console.log("[DELETE PARTNER] Using repo:", repo, "branch:", branch);

  // Define JSON file paths for homepage and products-and-partners data
  const homepageFilePath = "src/data/homepage.json";
  const partnersFilePath = "src/data/products-and-partners.json";
  console.log("[DELETE PARTNER] Homepage file path:", homepageFilePath);
  console.log("[DELETE PARTNER] Partners file path:", partnersFilePath);

  // Parse request payload (expects a JSON payload with the partner key, e.g., { "key": "logo7" })
  let body;
  try {
    body = await req.json();
    console.log("[DELETE PARTNER] Parsed request body:", body);
  } catch (err) {
    console.error("[DELETE PARTNER] Error parsing request body:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
    });
  }
  const partnerKey = body.key;
  if (!partnerKey) {
    console.error("[DELETE PARTNER] Missing partner key in payload.");
    return new Response(JSON.stringify({ error: "Missing partner key" }), {
      status: 400,
    });
  }
  console.log("[DELETE PARTNER] Partner key to delete:", partnerKey);

  // Fetch homepage.json from GitHub
  const homepageUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}?ref=${branch}`;
  console.log("[DELETE PARTNER] Fetching homepage data from URL:", homepageUrl);
  const homepageResponse = await fetch(homepageUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const homepageData = await homepageResponse.json();
  console.log("[DELETE PARTNER] Homepage response data:", homepageData);
  if (!homepageResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error fetching homepage.json:",
      homepageData
    );
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve homepage data",
        details: homepageData,
      }),
      { status: 500 }
    );
  }
  const homepageSha = homepageData.sha;
  console.log("[DELETE PARTNER] Homepage file SHA:", homepageSha);
  const homepageContentString = Buffer.from(
    homepageData.content,
    "base64"
  ).toString("utf8");
  console.log(
    "[DELETE PARTNER] Raw homepage JSON string:",
    homepageContentString
  );
  let homepageContent;
  try {
    homepageContent = JSON.parse(homepageContentString);
  } catch (err) {
    console.error("[DELETE PARTNER] Error parsing homepage JSON:", err);
    return new Response(
      JSON.stringify({
        error: "Homepage JSON is invalid",
        details: err.message,
      }),
      { status: 500 }
    );
  }
  console.log("[DELETE PARTNER] Parsed homepage content:", homepageContent);

  // Fetch products-and-partners.json from GitHub
  const partnersUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}?ref=${branch}`;
  console.log("[DELETE PARTNER] Fetching partners data from URL:", partnersUrl);
  const partnersResponse = await fetch(partnersUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const partnersData = await partnersResponse.json();
  console.log("[DELETE PARTNER] Partners response data:", partnersData);
  if (!partnersResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error fetching products-and-partners.json:",
      partnersData
    );
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve partners data",
        details: partnersData,
      }),
      { status: 500 }
    );
  }
  const partnersSha = partnersData.sha;
  console.log("[DELETE PARTNER] Partners file SHA:", partnersSha);
  const partnersContentString = Buffer.from(
    partnersData.content,
    "base64"
  ).toString("utf8");
  console.log(
    "[DELETE PARTNER] Raw partners JSON string:",
    partnersContentString
  );
  let partnersContent;
  try {
    partnersContent = JSON.parse(partnersContentString);
  } catch (err) {
    console.error("[DELETE PARTNER] Error parsing partners JSON:", err);
    return new Response(
      JSON.stringify({
        error: "Partners JSON is invalid",
        details: err.message,
      }),
      { status: 500 }
    );
  }
  console.log("[DELETE PARTNER] Parsed partners content:", partnersContent);

  // Validate that the partner exists in homepageContent.partnerLogos
  if (
    !homepageContent.partnerLogos ||
    !homepageContent.partnerLogos[partnerKey]
  ) {
    console.error(
      "[DELETE PARTNER] Partner key not found in homepage data:",
      partnerKey
    );
    return new Response(
      JSON.stringify({ error: "Partner not found in homepage data" }),
      { status: 404 }
    );
  }

  // Get the logo path from homepage data
  const logoPath = homepageContent.partnerLogos[partnerKey];
  console.log("[DELETE PARTNER] Logo path to remove:", logoPath);

  // Delete the image file from GitHub (located under public/logos/)
  // Construct the repository image path. We expect logoPath to start with "/logos"
  const repoImagePath = logoPath.startsWith("/logos")
    ? "public" + logoPath
    : logoPath;
  console.log("[DELETE PARTNER] Repo image path for deletion:", repoImagePath);

  // Fetch the current file info to get the file SHA for deletion
  const imageFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoImagePath}?ref=${branch}`;
  console.log(
    "[DELETE PARTNER] Fetching image file info from URL:",
    imageFileUrl
  );
  const imageResponse = await fetch(imageFileUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const imageData = await imageResponse.json();
  console.log("[DELETE PARTNER] Image file info:", imageData);
  if (!imageResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error fetching image file info:",
      imageData
    );
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve image file info",
        details: imageData,
      }),
      { status: 500 }
    );
  }
  const imageSha = imageData.sha;
  console.log("[DELETE PARTNER] Image file SHA:", imageSha);

  // Delete the image file via GitHub API
  const imageDeletePayload = {
    message: `Delete partner image ${repoImagePath}`,
    sha: imageSha,
    branch: branch,
  };
  console.log(
    "[DELETE PARTNER] Deleting image file with payload:",
    imageDeletePayload
  );
  const imageDeleteResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoImagePath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imageDeletePayload),
    }
  );
  const imageDeleteResult = await imageDeleteResponse.json();
  console.log("[DELETE PARTNER] Image delete result:", imageDeleteResult);
  if (!imageDeleteResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error deleting image file:",
      imageDeleteResult
    );
    return new Response(
      JSON.stringify({
        error: "Failed to delete partner image",
        details: imageDeleteResult,
      }),
      { status: 500 }
    );
  }
  console.log("[DELETE PARTNER] Image file deleted successfully.");

  // Remove the partner from homepageContent.partnerLogos
  delete homepageContent.partnerLogos[partnerKey];
  console.log("[DELETE PARTNER] Removed partner key from homepage data.");

  // Remove the partner from products-and-partners.json
  // The updated structure stores partners as an object keyed by numeric strings.
  if (
    !partnersContent.partners ||
    typeof partnersContent.partners !== "object"
  ) {
    console.error("[DELETE PARTNER] Invalid partners data structure");
    return new Response(
      JSON.stringify({ error: "Invalid partners data structure" }),
      { status: 500 }
    );
  }
  let partnerFound = false;
  for (const key in partnersContent.partners) {
    if (partnersContent.partners[key].logo === logoPath) {
      delete partnersContent.partners[key];
      partnerFound = true;
      console.log(
        "[DELETE PARTNER] Removed partner entry from products-and-partners data with key:",
        key
      );
      break;
    }
  }
  if (!partnerFound) {
    console.warn(
      "[DELETE PARTNER] Partner not found in products-and-partners data"
    );
  }

  // Update homepage.json on GitHub
  const updatedHomepageContentString = JSON.stringify(homepageContent, null, 2);
  console.log(
    "[DELETE PARTNER] Updated homepage content string:",
    updatedHomepageContentString
  );
  const updatedHomepageContentBase64 = Buffer.from(
    updatedHomepageContentString
  ).toString("base64");
  const homepageUpdatePayload = {
    message: `Delete partner ${partnerKey} from homepage`,
    content: updatedHomepageContentBase64,
    sha: homepageSha,
    branch: branch,
  };
  console.log(
    "[DELETE PARTNER] Homepage update payload:",
    homepageUpdatePayload
  );
  const homepageUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`;
  console.log(
    "[DELETE PARTNER] Updating homepage.json at URL:",
    homepageUpdateUrl
  );
  const homepageUpdateResponse = await fetch(homepageUpdateUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(homepageUpdatePayload),
  });
  const homepageUpdateResult = await homepageUpdateResponse.json();
  console.log("[DELETE PARTNER] Homepage update result:", homepageUpdateResult);
  if (!homepageUpdateResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error updating homepage.json:",
      homepageUpdateResult
    );
    return new Response(
      JSON.stringify({
        error: "Failed to update homepage.json",
        details: homepageUpdateResult,
      }),
      { status: 500 }
    );
  }

  // Update products-and-partners.json on GitHub
  const updatedPartnersContentString = JSON.stringify(partnersContent, null, 2);
  console.log(
    "[DELETE PARTNER] Updated partners content string:",
    updatedPartnersContentString
  );
  const updatedPartnersContentBase64 = Buffer.from(
    updatedPartnersContentString
  ).toString("base64");
  const partnersUpdatePayload = {
    message: `Delete partner ${partnerKey} from products-and-partners`,
    content: updatedPartnersContentBase64,
    sha: partnersSha,
    branch: branch,
  };
  console.log(
    "[DELETE PARTNER] Partners update payload:",
    partnersUpdatePayload
  );
  const partnersUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}`;
  console.log(
    "[DELETE PARTNER] Updating products-and-partners.json at URL:",
    partnersUpdateUrl
  );
  const partnersUpdateResponse = await fetch(partnersUpdateUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(partnersUpdatePayload),
  });
  const partnersUpdateResult = await partnersUpdateResponse.json();
  console.log("[DELETE PARTNER] Partners update result:", partnersUpdateResult);
  if (!partnersUpdateResponse.ok) {
    console.error(
      "[DELETE PARTNER] Error updating products-and-partners.json:",
      partnersUpdateResult
    );
    return new Response(
      JSON.stringify({
        error: "Failed to update products-and-partners.json",
        details: partnersUpdateResult,
      }),
      { status: 500 }
    );
  }

  console.log("[DELETE PARTNER] Partner deletion completed successfully.");
  return new Response(
    JSON.stringify({
      message: "Partner deleted successfully",
      key: partnerKey,
    }),
    { status: 200 }
  );
}
