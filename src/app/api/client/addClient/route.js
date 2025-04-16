import { Buffer } from "buffer";

export async function POST(req) {
  console.log("[ADD CLIENT] Received add client request");

  // Environment variables for GitHub API
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  // Define the JSON file path for homepage data only.
  const homepageFilePath = "src/data/homepage.json";

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
    console.error("[ADD CLIENT] Error fetching homepage.json:", homepageData);
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
  const homepageContent = JSON.parse(homepageContentString);

  // Parse incoming form data
  const formData = await req.formData();
  const nameField = formData.get("name");
  const typeField = formData.get("type");
  const file = formData.get("file");

  if (!nameField || !typeField || !file) {
    console.error("[ADD CLIENT] Missing required fields in form data");
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Validate file type – only .webp images are allowed.
  if (file.type !== "image/webp") {
    console.error("[ADD CLIENT] Invalid file type:", file.type);
    return new Response(
      JSON.stringify({ error: "Only .webp images are allowed" }),
      { status: 400 }
    );
  }

  // Prepare file for upload: Convert to Base64‑encoded string.
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = fileBuffer.toString("base64").replace(/\n/g, "");

  // Ensure clientData exists and initialize type bucket
  if (
    !homepageContent.clientData ||
    typeof homepageContent.clientData !== "object"
  ) {
    homepageContent.clientData = {};
  }
  const clientType = typeField.toString();
  if (!homepageContent.clientData[clientType]) {
    homepageContent.clientData[clientType] = {};
  }

  // —–– GLOBAL INDEX LOGIC —––––
  // Gather every "logoX" key across all types:
  const allKeys = Object.values(homepageContent.clientData).flatMap((typeObj) =>
    Object.keys(typeObj)
  );

  // Extract numeric suffixes and filter valid numbers:
  const indices = allKeys
    .map((key) => parseInt(key.replace(/^logo/, ""), 10))
    .filter((n) => !isNaN(n));

  // Next index is max+1, or 1 if none exist:
  const newIndex = indices.length ? Math.max(...indices) + 1 : 1;
  // —––––––––––––––––––––––––––––––––––––––––––––

  // Construct new file name and image path for the client logo.
  const newFileName = `clientLogo${newIndex}.webp`;
  const newImagePath = `/logos/${newFileName}`;

  // Compute the repository path for the new image (assuming logos are stored in public/logos).
  const posixNewImagePath = newImagePath.replace(/\\/g, "/");
  let repoNewImagePath = "";
  if (posixNewImagePath.startsWith("/logos")) {
    repoNewImagePath = "public" + posixNewImagePath;
  } else {
    repoNewImagePath = posixNewImagePath.startsWith("/")
      ? posixNewImagePath.slice(1)
      : posixNewImagePath;
  }

  // --- Upload the new image to GitHub ---
  const putPayload = {
    message: `Upload new client logo ${newFileName}`,
    content: imageBase64,
    branch: branch,
  };
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;
  const putResponse = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(putPayload),
  });
  const putResult = await putResponse.json();
  if (!putResponse.ok) {
    console.error("[ADD CLIENT] Error uploading new image:", putResult);
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }

  // Update homepage.json: add the new client entry under the correct type.
  homepageContent.clientData[clientType][`logo${newIndex}`] = newImagePath;
  const updatedHomepageContentString = JSON.stringify(homepageContent, null, 2);
  const updatedHomepageContentBase64 = Buffer.from(
    updatedHomepageContentString
  ).toString("base64");
  const homepageUpdatePayload = {
    message: `Add new client logo ${newFileName} to homepage`,
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
      "[ADD CLIENT] Error updating homepage.json:",
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

  console.log("[ADD CLIENT] Client added successfully");
  return new Response(
    JSON.stringify({
      message: "Client added successfully",
      imagePath: newImagePath,
      type: clientType,
      key: `logo${newIndex}`,
    }),
    { status: 200 }
  );
}
