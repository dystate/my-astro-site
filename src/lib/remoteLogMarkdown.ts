import { marked } from "marked";

interface RemotePhoto {
  src: string;
  title?: string;
  caption?: string;
}

const marker = /<!--\s*journal-photo-stack:([A-Za-z0-9_=-]+)\s*-->/g;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parsePhotos(payload: string): RemotePhoto[] {
  try {
    const source = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = JSON.parse(source) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      if (typeof value.src !== "string" || !value.src) return [];
      return [{
        src: value.src,
        title: typeof value.title === "string" ? value.title : undefined,
        caption: typeof value.caption === "string" ? value.caption : undefined,
      }];
    });
  } catch {
    return [];
  }
}

function photoStack(photos: RemotePhoto[]): string {
  if (!photos.length) return "";
  const total = String(photos.length).padStart(2, "0");
  const cards = photos.map((photo, index) => `
    <div class="rps-card-wrap" style="--rps-top:${index * 26}px;--rps-offset:${index * 14}px;--rps-scale:${1 - index * .04};--rps-reverse:${photos.length - index}">
      <div class="rps-card">
        <img class="rps-media" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.title || photo.caption || "Journal photo")}" loading="lazy" />
        <div class="rps-overlay"></div>
        <div class="rps-info">
          ${photo.title ? `<div class="rps-title">${escapeHtml(photo.title)}</div>` : ""}
          ${photo.caption ? `<div class="rps-caption">${escapeHtml(photo.caption)}</div>` : ""}
        </div>
        <span class="rps-number">${String(index + 1).padStart(2, "0")} / ${total}</span>
      </div>
    </div>`).join("");
  return `
    <div class="remote-photo-stack">
      <div class="rps-toolbar"><button type="button" class="rps-toggle" aria-pressed="false">收起 ↑</button></div>
      <div class="rps-cards">${cards}</div>
    </div>`;
}

export async function renderRemoteLogMarkdown(body: string): Promise<string> {
  let cursor = 0;
  let output = "";
  for (const match of body.matchAll(marker)) {
    const index = match.index ?? 0;
    output += await marked.parse(body.slice(cursor, index));
    output += photoStack(parsePhotos(match[1]));
    cursor = index + match[0].length;
  }
  output += await marked.parse(body.slice(cursor));
  return output;
}
