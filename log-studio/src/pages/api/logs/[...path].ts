import type { APIRoute } from "astro";
import type { SaveLogInput } from "../../../lib/types";
import { errorResponse, requireStudioUser } from "../../../lib/server/auth";
import { getContentStore } from "../../../lib/server/content-store";
import { corsHeaders, json, preflight } from "../../../lib/server/cors";

export const prerender = false;
export const OPTIONS: APIRoute = async ({ request }) => preflight(request);

function logPath(value: string | undefined): string {
  if (!value) throw new Error("缺少日志路径");
  try { return decodeURIComponent(value); } catch { return value; }
}

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await requireStudioUser(request);
    return json(request, await getContentStore().read(logPath(params.path)));
  } catch (error) {
    return errorResponse(error, corsHeaders(request));
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const user = await requireStudioUser(request);
    const body = await request.json() as SaveLogInput;
    const path = logPath(params.path);
    if (body.path !== path) body.path = path;
    const result = await getContentStore().save({
      ...body,
      message: body.message || `logs: save ${path} by ${user.email}`,
    });
    return json(request, result);
  } catch (error) {
    return errorResponse(error, corsHeaders(request));
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await requireStudioUser(request);
    const body = await request.json().catch(() => ({ sha: null })) as { sha?: string | null };
    await getContentStore().remove(logPath(params.path), body.sha ?? null);
    return json(request, { ok: true });
  } catch (error) {
    return errorResponse(error, corsHeaders(request));
  }
};
