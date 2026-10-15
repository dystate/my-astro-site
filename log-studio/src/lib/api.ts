import type { LogDocument, LogFile, SaveLogInput } from "./types";

const configuredApiBase = (import.meta.env.PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "");

function apiUrl(path: string): string {
  if (!configuredApiBase && import.meta.env.PUBLIC_MOBILE_MODE === "true") {
    throw new Error("App 尚未配置网站同步地址");
  }
  return `${configuredApiBase}${path}`;
}

async function request<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(url), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `请求失败 (${response.status})`);
  return payload as T;
}

export function listLogs(token: string): Promise<{ files: LogFile[]; folders: string[]; provider: string }> {
  return request("/api/logs/tree", token);
}

export function createLogFolder(path: string, token: string): Promise<{ path: string }> {
  return request("/api/logs/tree", token, {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}

export function readLog(path: string, token: string): Promise<LogDocument> {
  return request(`/api/logs/${encodeURIComponent(path)}`, token);
}

export function saveLog(input: SaveLogInput, token: string): Promise<LogDocument> {
  return request(`/api/logs/${encodeURIComponent(input.path)}`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function removeLog(path: string, sha: string | null, token: string): Promise<{ ok: true }> {
  return request(`/api/logs/${encodeURIComponent(path)}`, token, {
    method: "DELETE",
    body: JSON.stringify({ sha }),
  });
}

export function readSecret(token: string): Promise<{ text: string }> {
  return request("/api/secret.json", token);
}

export function saveSecret(text: string, token: string): Promise<{ ok: true }> {
  return request("/api/secret.json", token, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
