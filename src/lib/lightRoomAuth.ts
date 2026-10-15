const encoder = new TextEncoder();
export const LIGHT_ROOM_ACCESS_SECONDS = 365 * 24 * 60 * 60;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export async function createLightRoomToken(secret: string) {
  const expiresAt = Date.now() + LIGHT_ROOM_ACCESS_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifyLightRoomToken(token: string | undefined, secret: string) {
  if (!token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || Number(payload) <= Date.now()) return false;

  const expected = await sign(payload, secret);
  return constantTimeEqual(signature, expected);
}

export function passwordsMatch(input: string, expected: string) {
  return constantTimeEqual(input, expected);
}
