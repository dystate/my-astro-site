const allowedOrigins = (process.env.LOG_STUDIO_ALLOWED_ORIGINS || "capacitor://localhost,http://localhost")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const allowed = allowedOrigins.includes("*") || allowedOrigins.includes(origin);
  return {
    "access-control-allow-origin": allowed ? origin : allowedOrigins[0] || "capacitor://localhost",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    vary: "Origin",
  };
}

export function json(request: Request, body: unknown, init: ResponseInit = {}): Response {
  return Response.json(body, { ...init, headers: { ...corsHeaders(request), ...init.headers } });
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
