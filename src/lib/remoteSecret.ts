const SECRET_PATH = "__secret__/light-room.txt";

function credentials() {
  return {
    url: import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "https://tsckvnducjsjmfyoblyu.supabase.co",
    key: import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ou0HOOnOt1PN6TwUifIz3g_zISEWRBO",
  };
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encryptionKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptSecretText(text: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(secret),
    new TextEncoder().encode(text),
  );
  return `v1.${base64UrlEncode(iv)}.${base64UrlEncode(new Uint8Array(encrypted))}`;
}

export async function decryptSecretText(value: string, secret: string) {
  if (!value) return "";
  const [version, iv, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !encrypted) return "";
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64UrlDecode(iv) },
      await encryptionKey(secret),
      base64UrlDecode(encrypted),
    );
    return new TextDecoder().decode(plain);
  } catch {
    return "";
  }
}

export async function readSecretCiphertext(authorization?: string) {
  const { url, key } = credentials();
  const query = new URLSearchParams({
    select: "content",
    path: `eq.${SECRET_PATH}`,
    limit: "1",
  });
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/log_entries?${query}`, {
    headers: {
      apikey: key,
      authorization: authorization || `Bearer ${key}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return "";
  const rows = await response.json() as Array<{ content?: string }>;
  return rows[0]?.content ?? "";
}

export async function getPublishedSecretText(secret: string) {
  return decryptSecretText(await readSecretCiphertext(), secret);
}

export function secretSupabaseCredentials() {
  return credentials();
}

export const secretStoragePath = SECRET_PATH;
