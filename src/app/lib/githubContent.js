import { Buffer } from "buffer";

// Thin wrapper around the GitHub contents API used by the admin routes.
// Every call checks the response and throws a GitHubError on failure, so a
// rejected upload can never be recorded in the JSON as if it had succeeded.

export class GitHubError extends Error {
  constructor(action, path, status, details) {
    super(`GitHub ${action} failed for ${path} (${status})`);
    this.status = status;
    this.details = details;
  }
}

export function githubConfig() {
  const repo = (process.env.GITHUB_REPO || "")
    .replace("https://github.com/", "")
    .split("/")
    .filter(Boolean)
    .pop();
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo,
    branch: process.env.GITHUB_STAGING_BRANCH || "master",
  };
}

function contentsUrl({ owner, repo }, path) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

function headers({ token }) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

// Returns { sha, content } or null when the file does not exist.
export async function getFile(cfg, path) {
  const res = await fetch(`${contentsUrl(cfg, path)}?ref=${cfg.branch}`, {
    headers: headers(cfg),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  const json = await res.json();
  if (!res.ok) throw new GitHubError("read", path, res.status, json);
  return json;
}

export async function getJson(cfg, path) {
  const file = await getFile(cfg, path);
  if (!file) throw new GitHubError("read", path, 404, null);
  return {
    sha: file.sha,
    data: JSON.parse(Buffer.from(file.content, "base64").toString("utf8")),
  };
}

// Creates a file, or replaces it when `sha` is given.
export async function putFile(cfg, path, base64, message, sha) {
  const res = await fetch(contentsUrl(cfg, path), {
    method: "PUT",
    headers: headers(cfg),
    body: JSON.stringify({ message, content: base64, branch: cfg.branch, sha }),
  });
  const json = await res.json();
  if (!res.ok) throw new GitHubError("write", path, res.status, json);
  return json;
}

export async function putJson(cfg, path, data, sha, message) {
  const base64 = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  return putFile(cfg, path, base64, message, sha);
}

// Deletes a file; returns false when it was already gone.
export async function deleteFile(cfg, path, message) {
  const file = await getFile(cfg, path);
  if (!file) return false;
  const res = await fetch(contentsUrl(cfg, path), {
    method: "DELETE",
    headers: headers(cfg),
    body: JSON.stringify({ message, sha: file.sha, branch: cfg.branch }),
  });
  if (!res.ok) {
    throw new GitHubError("delete", path, res.status, await res.json());
  }
  return true;
}

// Picks a file name that is not already taken in the repo.
export async function freePath(cfg, makePath, start) {
  for (let n = start; n < start + 50; n++) {
    if (!(await getFile(cfg, makePath(n)))) return { path: makePath(n), n };
  }
  throw new GitHubError("allocate", makePath(start), 409, null);
}

export function errorResponse(err, label) {
  console.error(`[${label}]`, err.message, err.details || "");
  const status = err instanceof GitHubError ? 502 : 500;
  return Response.json(
    { error: err.message, details: err.details },
    { status }
  );
}
