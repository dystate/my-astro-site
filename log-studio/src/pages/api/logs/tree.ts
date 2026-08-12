import type { APIRoute } from "astro";
import { errorResponse, requireStudioUser } from "../../../lib/server/auth";
import { getContentStore } from "../../../lib/server/content-store";
import { corsHeaders, json, preflight } from "../../../lib/server/cors";

export const prerender = false;
export const OPTIONS: APIRoute = async ({ request }) => preflight(request);

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireStudioUser(request);
    const store = getContentStore();
    const tree = await store.list();
    return json(request, { ...tree, provider: store.name });
  } catch (error) {
    return errorResponse(error, corsHeaders(request));
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await requireStudioUser(request);
    const body = await request.json() as { path?: string };
    if (!body.path) return json(request, { error: "请填写分类名称" }, { status: 400 });
    const path = await getContentStore().createFolder(body.path);
    return json(request, { path }, { status: 201 });
  } catch (error) {
    return errorResponse(error, corsHeaders(request));
  }
};
