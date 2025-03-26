import { Buffer } from "buffer";
import { NextResponse } from "next/server";

// Helper: update the JSON file on GitHub
async function updateJsonFile(
  filePath,
  token,
  owner,
  repo,
  branch,
  newContent
) {
  console.log("Updating JSON file at:", filePath);
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  console.log("JSON GET URL:", getUrl);
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const fileData = await getRes.json();
  console.log("Fetched JSON file data:", fileData);
  const sha = fileData.sha;
  const contentString = JSON.stringify(newContent, null, 2);
  const contentBase64 = Buffer.from(contentString).toString("base64");

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  console.log("JSON PUT URL:", putUrl);
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Update JSON file after editing image alt text`,
      content: contentBase64,
      sha,
      branch,
    }),
  });
  const putData = await putRes.json();
  console.log("JSON update response:", putData);
  return putData;
}

export async function POST(request, context) {
  try {
    const { params } = await context;
    const page = params.page;
    console.log("Editing image alt text for page:", page);

    // Expecting JSON with { section, key, newAlt }
    const { section, key, newAlt } = await request.json();
    console.log("Payload received:", { section, key, newAlt });

    if (!section) {
      console.error("Section missing in payload");
      return new NextResponse(
        JSON.stringify({
          error: "Section missing in payload",
          details:
            "Please provide the section (e.g. 'ourLegacy', 'partnerLogos').",
        }),
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const ownerEnv = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    console.log("Using owner:", ownerEnv, "repo:", repo, "branch:", branch);

    // Get current JSON file
    const jsonFilePath = `src/data/${page}.json`;
    console.log("JSON file path:", jsonFilePath);
    const jsonUrl = `https://api.github.com/repos/${ownerEnv}/${repo}/contents/${jsonFilePath}?ref=${branch}`;
    console.log("Fetching JSON file from URL:", jsonUrl);
    const jsonRes = await fetch(jsonUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const jsonData = await jsonRes.json();
    console.log("Raw JSON data:", jsonData);
    const jsonContentStr = Buffer.from(jsonData.content, "base64").toString(
      "utf8"
    );
    console.log("Decoded JSON content string:", jsonContentStr);
    const jsonContent = JSON.parse(jsonContentStr);
    console.log("Parsed JSON content:", jsonContent);

    if (!jsonContent[section]) {
      console.error(`Section "${section}" not found in JSON.`);
      return new NextResponse(
        JSON.stringify({
          error: "Section not found in JSON",
          details: `Section "${section}" does not exist.`,
        }),
        { status: 500 }
      );
    }

    // Get the current image URL from the specified section
    const currentImageUrl = jsonContent[section][key]; // e.g. "/images/legacy-image-1.webp"
    if (!currentImageUrl) {
      console.error(`Key "${key}" not found in section "${section}".`);
      return new NextResponse(
        JSON.stringify({
          error: "Image key not found",
          details: `Key "${key}" not found in section "${section}".`,
        }),
        { status: 500 }
      );
    }
    console.log("Current image URL from JSON:", currentImageUrl);

    // Derive index from key (e.g., "image2" -> "2") and corresponding alt key.
    const index = key.replace(/^\D+/, "");
    const altKey = `alt${index}`;
    console.log("Derived index:", index, "and alt key:", altKey);

    // Update JSON file with the same image path and new alt value.
    jsonContent[section][key] = currentImageUrl; // No change in filename
    if (newAlt !== undefined) {
      jsonContent[section][altKey] = newAlt;
    }
    console.log("Final updated JSON content:", jsonContent);

    const updateJsonResult = await updateJsonFile(
      jsonFilePath,
      token,
      ownerEnv,
      repo,
      branch,
      jsonContent
    );
    console.log(
      "Updated JSON file after editing image alt text:",
      updateJsonResult
    );

    return new NextResponse(
      JSON.stringify({ success: true, content: jsonContent }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
