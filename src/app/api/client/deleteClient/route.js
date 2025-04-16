import { Buffer } from "buffer";

export async function DELETE(req) {
  console.log("[DELETE CLIENT] Received delete client request");

  // Environment variables for GitHub API
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  // Define the JSON file path for homepage data only.
  const homepageFilePath = "src/data/homepage.json";

  // Parse request payload (expects JSON with the client type and key, e.g., { "type": "energy", "key": "logo1" })
  let body;
  try {
    body = await req.json();
    console.log("[DELETE CLIENT] Parsed request body:", body);
  } catch (err) {
    console.error("[DELETE CLIENT] Error parsing request body:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
    });
  }
  const clientType = body.type;
  const clientKey = body.key;
  if (!clientType || !clientKey) {
    console.error("[DELETE CLIENT] Missing required fields in payload.");
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }
  console.log("[DELETE CLIENT] Type:", clientType, "Key:", clientKey);

  // Fetch homepage.json from GitHub
  const homepageUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}?ref=${branch}`;
  const homepageResponse = await fetch(homepageUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const homepageData = await homepageResponse.json();
  if (!homepageResponse.ok) {
    console.error(
      "[DELETE CLIENT] Error fetching homepage.json:",
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
  const homepageContentString = Buffer.from(
    homepageData.content,
    "base64"
  ).toString("utf8");
  let homepageContent;
  try {
    homepageContent = JSON.parse(homepageContentString);
  } catch (err) {
    console.error("[DELETE CLIENT] Error parsing homepage JSON:", err);
    return new Response(
      JSON.stringify({ error: "Invalid homepage JSON", details: err.message }),
      { status: 500 }
    );
  }

  // Validate that the client exists in homepageContent.clientData
  if (
    !homepageContent.clientData ||
    !homepageContent.clientData[clientType] ||
    !homepageContent.clientData[clientType][clientKey]
  ) {
    console.error(
      "[DELETE CLIENT] Client not found in homepage data:",
      clientType,
      clientKey
    );
    return new Response(
      JSON.stringify({ error: "Client not found in homepage data" }),
      { status: 404 }
    );
  }

  // Get the logo path from homepage data
  const logoPath = homepageContent.clientData[clientType][clientKey];
  console.log("[DELETE CLIENT] Logo path to remove:", logoPath);

  // Delete the image file from GitHub (assumes logos stored in public/logos/)
  const repoImagePath = logoPath.startsWith("/logos")
    ? "public" + logoPath
    : logoPath;
  const imageFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoImagePath}?ref=${branch}`;
  const imageResponse = await fetch(imageFileUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const imageData = await imageResponse.json();
  if (!imageResponse.ok) {
    console.error("[DELETE CLIENT] Error fetching image file info:", imageData);
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve image file info",
        details: imageData,
      }),
      { status: 500 }
    );
  }
  const imageSha = imageData.sha;

  // Delete the image file via GitHub API
  const imageDeletePayload = {
    message: `Delete client image ${repoImagePath}`,
    sha: imageSha,
    branch: branch,
  };
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
  if (!imageDeleteResponse.ok) {
    console.error(
      "[DELETE CLIENT] Error deleting image file:",
      imageDeleteResult
    );
    return new Response(
      JSON.stringify({
        error: "Failed to delete client image",
        details: imageDeleteResult,
      }),
      { status: 500 }
    );
  }
  console.log("[DELETE CLIENT] Image file deleted successfully.");

  // Remove the client entry from homepageContent.clientData
  delete homepageContent.clientData[clientType][clientKey];
  console.log("[DELETE CLIENT] Removed client entry from homepage data.");

  // Update homepage.json on GitHub with the new clientData
  const updatedHomepageContentString = JSON.stringify(homepageContent, null, 2);
  const updatedHomepageContentBase64 = Buffer.from(
    updatedHomepageContentString
  ).toString("base64");
  const homepageUpdatePayload = {
    message: `Delete client ${clientKey} (${clientType}) from homepage`,
    content: updatedHomepageContentBase64,
    sha: homepageSha,
    branch: branch,
  };
  const homepageUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`;
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
  if (!homepageUpdateResponse.ok) {
    console.error(
      "[DELETE CLIENT] Error updating homepage.json:",
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

  console.log("[DELETE CLIENT] Client deletion completed successfully.");
  return new Response(
    JSON.stringify({
      message: "Client deleted successfully",
      type: clientType,
      key: clientKey,
    }),
    { status: 200 }
  );
}
