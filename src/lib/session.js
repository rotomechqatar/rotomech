// Signed admin session tokens. Uses Web Crypto only, so it runs both in route
// handlers (Node) and in middleware (edge runtime).
//
// Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature)
// Payload: { u: username, exp: expiry in ms since epoch }

export const SESSION_COOKIE = "auth-token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // Fail closed: without a strong secret no token can be issued or accepted.
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Returns a signed token for the user, or null if ADMIN_SESSION_SECRET is unset.
export async function createSessionToken(username) {
  const key = await getKey();
  if (!key) return null;
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({ u: username, exp: Date.now() + SESSION_MAX_AGE * 1000 })
    )
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

// Returns the session payload if the token is authentic and unexpired, else null.
export async function verifySessionToken(token) {
  try {
    if (!token) return null;
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) return null;
    const key = await getKey();
    if (!key) return null;
    // crypto.subtle.verify compares signatures in constant time.
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(payload)
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof session.exp !== "number" || session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
