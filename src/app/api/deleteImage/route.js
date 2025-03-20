export async function DELETE(request) {
  try {
    // Expecting JSON with { filename }
    const { filename } = await request.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_STAGING_BRANCH || "master";
    const filePath = `public/images/${filename}`;

    // Get the current file info to get the SHA
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
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve image info",
          details: fileData,
        }),
        { status: 500 }
      );
    }
    const sha = fileData.sha;

    // Delete the file from GitHub
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete image ${filename} via admin panel`,
          sha,
          branch,
        }),
      }
    );
    const deleteData = await deleteResponse.json();
    if (!deleteResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to delete image",
          details: deleteData,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: deleteData }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
