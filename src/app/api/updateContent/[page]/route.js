// import { Buffer } from "buffer";
//
// export async function POST(request) {
//   try {
//     // Now reading title, description, and image from the request body
//     const { title, description, image } = await request.json();
//     const token = process.env.GITHUB_TOKEN;
//     const owner = process.env.GITHUB_OWNER;
//     const repo =
//       process.env.GITHUB_REPO.replace("https://github.com/", "").split(
//         "/"
//       )[1] || process.env.GITHUB_REPO;
//     const branch = process.env.GITHUB_STAGING_BRANCH || "master";
//     const filePath = "src/data/homePageContent.json";
//
//     // Step 1: Retrieve the current file info from GitHub to get the SHA
//     const getResponse = await fetch(
//       `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
//       {
//         headers: {
//           Authorization: `token ${token}`,
//           Accept: "application/vnd.github+json",
//         },
//       }
//     );
//     const fileData = await getResponse.json();
//     if (!getResponse.ok) {
//       console.error("Error fetching file info:", fileData);
//       return new Response(
//         JSON.stringify({
//           error: "Failed to retrieve current content info",
//           details: fileData,
//         }),
//         { status: 500 }
//       );
//     }
//     const sha = fileData.sha;
//
//     // Step 2: Prepare the new content, now including the image field
//     const newContent = { title, description, image };
//     const contentString = JSON.stringify(newContent, null, 2);
//     const contentBase64 = Buffer.from(contentString).toString("base64");
//
//     // Step 3: Update the file on GitHub using a PUT request
//     const putResponse = await fetch(
//       `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `token ${token}`,
//           Accept: "application/vnd.github+json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: "Update content via admin panel",
//           content: contentBase64,
//           sha,
//           branch,
//         }),
//       }
//     );
//     const updateData = await putResponse.json();
//     if (!putResponse.ok) {
//       console.error("Error updating file:", updateData);
//       return new Response(
//         JSON.stringify({
//           error: "Failed to update content on GitHub",
//           details: updateData,
//         }),
//         { status: 500 }
//       );
//     }
//
//     // Return the full updated content as the response
//     return new Response(
//       JSON.stringify({ success: true, content: newContent }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("Server error:", err);
//     return new Response(
//       JSON.stringify({ error: "Server error", details: err.message }),
//       { status: 500 }
//     );
//   }
// }

import { Buffer } from "buffer";

export async function POST(request, { params }) {
  try {
    const page = params.page;
    const filePath = `src/data/${page}PageContent.json`;
    const { title, description, image } = await request.json();
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";

    // Retrieve the current file info from GitHub to get the SHA
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    const fileData = await getResponse.json();
    if (!getResponse.ok) {
      console.error("Error fetching file info:", fileData);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve current content info",
          details: fileData,
        }),
        { status: 500 }
      );
    }
    const sha = fileData.sha;

    // Prepare the new content
    const newContent = { title, description, image };
    const contentString = JSON.stringify(newContent, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");

    // Update the file on GitHub using a PUT request
    const putResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update ${page} content via admin panel`,
          content: contentBase64,
          sha,
          branch,
        }),
      }
    );
    const updateData = await putResponse.json();
    if (!putResponse.ok) {
      console.error("Error updating file:", updateData);
      return new Response(
        JSON.stringify({
          error: "Failed to update content on GitHub",
          details: updateData,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, content: newContent }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
