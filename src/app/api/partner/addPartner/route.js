import { Buffer } from "buffer";

export async function POST(req) {
  console.log("[ADD PARTNER] Received add partner request");

  // Environment variables for GitHub API
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH || "master";

  // Define JSON file paths for homepage and products-and-partners data
  const homepageFilePath = "src/data/homepage.json";
  const partnersFilePath = "src/data/products-and-partners.json";

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
    console.error("[ADD PARTNER] Error fetching homepage.json:", homepageData);
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

  // Fetch products-and-partners.json from GitHub
  const partnersUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}?ref=${branch}`;
  const partnersResponse = await fetch(partnersUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const partnersData = await partnersResponse.json();
  if (!partnersResponse.ok) {
    console.error(
      "[ADD PARTNER] Error fetching products-and-partners.json:",
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
  const partnersContentString = Buffer.from(
    partnersData.content,
    "base64"
  ).toString("utf8");
  const partnersContent = JSON.parse(partnersContentString);

  // Parse incoming form data
  const formData = await req.formData();
  const nameField = formData.get("name");
  const descriptionField = formData.get("description");
  const linkField = formData.get("link");
  const file = formData.get("file");

  console.log("[ADD PARTNER] Incoming form data:", {
    name: nameField,
    description: descriptionField,
    link: linkField,
    fileType: file?.type,
  });

  // Validate that all compulsory fields are provided
  if (!nameField || !descriptionField || !linkField || !file) {
    console.error("[ADD PARTNER] Missing required fields in form data");
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Validate file type – only webp images are allowed.
  if (file.type !== "image/webp") {
    console.error("[ADD PARTNER] Invalid file type:", file.type);
    return new Response(
      JSON.stringify({ error: "Only webp images are allowed" }),
      { status: 400 }
    );
  }

  // Convert the file to a Base64‑encoded string.
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = fileBuffer.toString("base64");

  // Determine the next available index for partner logos in homepageContent.partnerLogos.
  // For example, if you currently have logo1 through logo6, then the new one will be logo7.
  const partnerLogos = homepageContent.partnerLogos || {};
  let index = 1;
  while (partnerLogos[`logo${index}`]) {
    index++;
  }
  console.log("[ADD PARTNER] Next available index:", index);

  // Construct new file name and image path for the partner logo.
  // For instance, new file will be "partnerLogo7.webp" stored at "/logos/partnerLogo7.webp".
  const newFileName = `partnerLogo${index}.webp`;
  const newImagePath = `/logos/${newFileName}`;
  console.log("[ADD PARTNER] New image path:", newImagePath);

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
  console.log(
    "[ADD PARTNER] Repo new image path for upload:",
    repoNewImagePath
  );

  // --- Upload the new image to GitHub ---
  const putPayload = {
    message: `Upload new partner logo ${newFileName}`,
    content: imageBase64,
    branch: branch,
  };
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoNewImagePath}`;
  console.log("[ADD PARTNER] Uploading new image to URL:", putUrl);
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
    console.error("[ADD PARTNER] Error uploading new image:", putResult);
    return new Response(
      JSON.stringify({
        error: "Failed to upload new image",
        details: putResult,
      }),
      { status: 500 }
    );
  }
  console.log("[ADD PARTNER] New image uploaded successfully.");

  // Update homepage.json: add the new logo path to the partnerLogos section.
  homepageContent.partnerLogos[`logo${index}`] = newImagePath;
  const updatedHomepageContentString = JSON.stringify(homepageContent, null, 2);
  const updatedHomepageContentBase64 = Buffer.from(
    updatedHomepageContentString
  ).toString("base64");
  const homepageUpdatePayload = {
    message: `Add new partner logo ${newFileName} to homepage`,
    content: updatedHomepageContentBase64,
    sha: homepageSha,
    branch: branch,
  };
  const homepageUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${homepageFilePath}`;
  console.log(
    "[ADD PARTNER] Updating homepage.json at URL:",
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
  if (!homepageUpdateResponse.ok) {
    console.error(
      "[ADD PARTNER] Error updating homepage.json:",
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
  console.log("[ADD PARTNER] homepage.json updated successfully.");

  // Update products-and-partners.json: add a new partner entry.
  if (!Array.isArray(partnersContent.partners)) {
    partnersContent.partners = [];
  }
  const newPartnerEntry = {
    name: nameField,
    logo: newImagePath,
    description: descriptionField,
    link: linkField,
  };
  partnersContent.partners.push(newPartnerEntry);
  const updatedPartnersContentString = JSON.stringify(partnersContent, null, 2);
  const updatedPartnersContentBase64 = Buffer.from(
    updatedPartnersContentString
  ).toString("base64");
  const partnersUpdatePayload = {
    message: `Add new partner ${nameField} to products-and-partners`,
    content: updatedPartnersContentBase64,
    sha: partnersSha,
    branch: branch,
  };
  const partnersUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${partnersFilePath}`;
  console.log(
    "[ADD PARTNER] Updating products-and-partners.json at URL:",
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
  if (!partnersUpdateResponse.ok) {
    console.error(
      "[ADD PARTNER] Error updating products-and-partners.json:",
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
  console.log("[ADD PARTNER] products-and-partners.json updated successfully.");

  return new Response(
    JSON.stringify({
      message: "Partner added successfully",
      imagePath: newImagePath,
      index: index,
    }),
    { status: 200 }
  );
}
