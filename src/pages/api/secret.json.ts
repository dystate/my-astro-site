import type { APIRoute } from "astro";
import {
  decryptSecretText,
  encryptSecretText,
  readSecretCiphertext,
  secretStoragePath,
  secretSupabaseCredentials,
} from "../../lib/remoteSecret";

export const prerender = false;

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = (import.meta.env.LIGHT_ROOM_ALLOWED_ORIGINS || "capacitor://localhost,http://localhost")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean);
  const allowed = allowedOrigins.includes("*") || allowedOrigins.includes(origin);
  return {
    "access-control-allow-origin": allowed ? origin : allowedOrigins[0] || "capacitor://localhost",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    vary: "Origin",
  };
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const { url, key } = secretSupabaseCredentials();
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { apikey: key, authorization },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string };
  return user.id ? { id: user.id, authorization } : null;
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(request),
    },
  });
}

export const OPTIONS: APIRoute = async ({ request }) => (
  new Response(null, { status: 204, headers: corsHeaders(request) })
);

export const GET: APIRoute = async ({ request }) => {
  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: "Unauthorized" }, 401);
  const secret = import.meta.env.SPECIAL_PAGE_SESSION_SECRET as string | undefined;
  if (!secret) return json(request, { error: "Secret storage is not configured" }, 503);
  const ciphertext = await readSecretCiphertext(user.authorization);
  return json(request, { text: await decryptSecretText(ciphertext, secret) });
};

export const POST: APIRoute = async ({ request }) => {
  const user = await authenticatedUser(request);
  if (!user) return json(request, { error: "Unauthorized" }, 401);
  const secret = import.meta.env.SPECIAL_PAGE_SESSION_SECRET as string | undefined;
  if (!secret) return json(request, { error: "Secret storage is not configured" }, 503);

  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  if (!body || typeof body.text !== "string") return json(request, { error: "Invalid text" }, 400);
  if (body.text.length > 200_000) return json(request, { error: "Text is too long" }, 413);

  const { url, key } = secretSupabaseCredentials();
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/log_entries?on_conflict=path`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: user.authorization,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      path: secretStoragePath,
      content: await encryptSecretText(body.text, secret),
      owner_id: user.id,
      published: true,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) return json(request, { error: "Could not save Secret" }, response.status);
  return json(request, { ok: true });
};
