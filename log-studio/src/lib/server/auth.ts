import { createClient } from "@supabase/supabase-js";

export interface StudioUser {
  id: string;
  email: string;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function bearerToken(request: Request): string {
  const value = request.headers.get("authorization") ?? "";
  const [scheme, token] = value.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) throw new HttpError(401, "请先登录");
  return token;
}

export async function requireStudioUser(request: Request): Promise<StudioUser> {
  const token = bearerToken(request);
  const bypass = (import.meta.env.DEV && process.env.DEV_BYPASS_AUTH === "true")
    || process.env.DESKTOP_MODE === "true";
  if (bypass && token === "dev-bypass") return { id: "local-dev", email: "local@dystate.dev" };

  const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new HttpError(500, "服务端尚未配置 Supabase");

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email) throw new HttpError(401, "登录已失效，请重新登录");

  const allowed = (process.env.LOG_STUDIO_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length > 0 && !allowed.includes(email)) throw new HttpError(403, "这个账号没有管理权限");

  return { id: data.user.id, email };
}

export function errorResponse(error: unknown, headers?: HeadersInit): Response {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "服务器发生未知错误";
  return Response.json({ error: message }, { status, headers });
}
