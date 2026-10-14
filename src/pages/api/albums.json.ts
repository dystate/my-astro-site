import type { APIRoute } from "astro";
import { ALBUM_ITEMS } from "../../data/album";
import { getRemoteAlbumState } from "../../lib/remoteAlbums";

export const prerender = false;

export const GET: APIRoute = async () => {
  const remote = await getRemoteAlbumState();
  const byId = new Map(
    ALBUM_ITEMS
      .filter((item) => !remote.hiddenIds.has(item.id))
      .map((item) => [item.id, item]),
  );
  for (const item of remote.entries) byId.set(item.id, item);
  const albums = [...byId.values()].sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER),
  );

  return new Response(JSON.stringify({ albums }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=300",
    },
  });
};
