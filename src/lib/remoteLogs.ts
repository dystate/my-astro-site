import YAML from "yaml";

export interface RemoteLogEntry {
  id: string;
  body: string;
  data: {
    title: string;
    date: Date;
    category: string;
    summary?: string;
    tags: string[];
    cover?: string;
    accent?: [string, string];
    motif?: string;
    draft: boolean;
  };
}

function parseDocument(path: string, source: string): RemoteLogEntry | null {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  try {
    const raw = YAML.parse(match[1]) as Record<string, unknown>;
    const date = new Date(String(raw.date || ""));
    if (!raw.title || Number.isNaN(date.valueOf())) return null;
    return {
      id: path.replace(/\.(md|mdx)$/i, ""),
      body: source.slice(match[0].length),
      data: {
        title: String(raw.title),
        date,
        category: String(raw.category || "dev"),
        summary: typeof raw.summary === "string" ? raw.summary : undefined,
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        cover: typeof raw.cover === "string" ? raw.cover : undefined,
        accent: Array.isArray(raw.accent) && raw.accent.length === 2 ? [String(raw.accent[0]), String(raw.accent[1])] : undefined,
        motif: typeof raw.motif === "string" ? raw.motif : undefined,
        draft: Boolean(raw.draft),
      },
    };
  } catch { return null; }
}

export async function getPublishedRemoteLogs(): Promise<RemoteLogEntry[]> {
  // Publishable credentials are intentionally safe to expose; RLS remains the authorization boundary.
  const url = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "https://tsckvnducjsjmfyoblyu.supabase.co";
  const key = import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ou0HOOnOt1PN6TwUifIz3g_zISEWRBO";
  if (!url || !key) return [];
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/log_entries?select=path,content&published=eq.true`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    if (!response.ok) return [];
    const rows = await response.json() as Array<{ path: string; content: string }>;
    return rows.map((row) => parseDocument(row.path, row.content)).filter((entry): entry is RemoteLogEntry => Boolean(entry));
  } catch { return []; }
}

export async function getPublishedRemoteLog(slug: string): Promise<RemoteLogEntry | null> {
  return (await getPublishedRemoteLogs()).find((entry) => entry.id === slug) || null;
}
