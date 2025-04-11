import { Buffer } from "buffer";

export async function GET(request, { params }) {
  // Extract the page parameter from the URL.
  const { page } = await params;
  const filePath = `src/data/${page}.json`;

  // Get GitHub credentials and configuration from environment variables.
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO.replace("https://github.com/", "").split("/")[1] ||
    process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_STAGING_BRANCH;

  // Build the URL to fetch the file from the specified branch.
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  try {
    // Fetch the file data from GitHub.
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const fileData = await getResponse.json();

    if (!getResponse.ok) {
      // Return an error response if file retrieval failed.
      return new Response(
        JSON.stringify({
          error: "Unable to read content from GitHub",
          details: fileData,
        }),
        { status: 500 }
      );
    }

    // Decode the file content from base64.
    const contentString = Buffer.from(fileData.content, "base64").toString(
      "utf8"
    );

    // Return the decoded content.
    return new Response(contentString, { status: 200 });
  } catch (error) {
    // Return an error response if something goes wrong.
    return new Response(
      JSON.stringify({
        error: "Error while fetching content",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
