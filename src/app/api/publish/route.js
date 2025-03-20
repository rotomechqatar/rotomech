// app/api/publish/route.js
export async function POST(request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo =
      process.env.GITHUB_REPO.replace("https://github.com/", "").split(
        "/"
      )[1] || process.env.GITHUB_REPO;
    const deployBranch = process.env.GITHUB_DEPLOY_BRANCH || "master";
    const stagingBranch = process.env.GITHUB_STAGING_BRANCH || "staging";

    // Step 1: Merge staging into deploy (publish changes)
    const mergePublishResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/merges`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          base: deployBranch, // target branch (production)
          head: stagingBranch, // branch with new changes
          commit_message: "Publish changes from admin panel",
        }),
      }
    );
    const mergePublishData = await mergePublishResponse.json();
    if (!mergePublishResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to merge staging branch into deploy branch",
          details: mergePublishData,
        }),
        { status: 500 }
      );
    }

    // Step 2: Get the latest commit SHA from the deploy branch
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${deployBranch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    const refData = await refResponse.json();
    if (!refResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to get deploy branch reference",
          details: refData,
        }),
        { status: 500 }
      );
    }
    const deploySha = refData.object.sha;

    // Step 3: Update the staging branch to match the deploy branch exactly
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${stagingBranch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          sha: deploySha,
          force: true,
        }),
      }
    );
    const updateRefData = await updateRefResponse.json();
    if (!updateRefResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to update staging branch reference",
          details: updateRefData,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        publishMerge: mergePublishData,
        updateStaging: updateRefData,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}
