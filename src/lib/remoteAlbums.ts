import type { AlbumItem } from "../data/album/types";

export interface RemoteAlbumState {
  entries: AlbumItem[];
  hiddenIds: Set<string>;
}

function credentials() {
  return {
    url: import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || "https://tsckvnducjsjmfyoblyu.supabase.co",
    key: import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ou0HOOnOt1PN6TwUifIz3g_zISEWRBO",
  };
}

export async function getRemoteAlbumState(): Promise<RemoteAlbumState> {
  const { url, key } = credentials();
  if (!url || !key) return { entries: [], hiddenIds: new Set() };
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/album_entries?select=slug,content,published`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    if (!response.ok) return { entries: [], hiddenIds: new Set() };
    const rows = await response.json() as Array<{ slug: string; content: string; published: boolean }>;
    const hiddenIds = new Set(rows.filter((row) => !row.published).map((row) => row.slug));
    const entries = rows
      .filter((row) => row.published)
      .map((row) => {
        try {
          const item = JSON.parse(row.content) as AlbumItem;
          return { ...item, id: row.slug, href: `/album/${row.slug}` };
        } catch {
          return null;
        }
      })
      .filter((item): item is AlbumItem => Boolean(item?.id && item?.title));
    return { entries, hiddenIds };
  } catch {
    return { entries: [], hiddenIds: new Set() };
  }
}

export async function getPublishedRemoteAlbums(): Promise<AlbumItem[]> {
  return (await getRemoteAlbumState()).entries;
}

export async function getPublishedRemoteAlbum(id: string): Promise<AlbumItem | null> {
  return (await getRemoteAlbumState()).entries.find((item) => item.id === id) ?? null;
}
