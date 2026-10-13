import { marked } from "marked";

interface RemotePhoto {
  src: string;
  title?: string;
  caption?: string;
}

type RemotePhotoLayout = "stack1" | "flow2";

interface RemotePhotoGallery {
  layout: RemotePhotoLayout;
  photos: RemotePhoto[];
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

function parseGallery(payload: string): RemotePhotoGallery {
  try {
    const source = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = JSON.parse(source) as unknown;
    if (!Array.isArray(parsed)) return { layout: "flow2", photos: [] };
    const first = parsed[0];
    const layout = first && typeof first === "object" &&
      (first as Record<string, unknown>).layout === "stack1"
      ? "stack1"
      : "flow2";
    const photos = parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      if (typeof value.src !== "string" || !value.src) return [];
      return [{
        src: value.src,
        title: typeof value.title === "string" ? value.title : undefined,
        caption: typeof value.caption === "string" ? value.caption : undefined,
      }];
    });
    return { layout, photos };
  } catch {
    return { layout: "flow2", photos: [] };
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

function photoFlow(photos: RemotePhoto[]): string {
  if (!photos.length) return "";
  const total = String(photos.length).padStart(2, "0");
  const cards = photos.map((photo, index) => `
    <article class="rpf-card${index === 0 ? " is-active" : ""}" data-flow-index="${index}" style="--rpf-ratio:1">
      <img class="rpf-media" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.title || photo.caption || "Journal photo")}" loading="lazy" />
      <div class="rpf-overlay"></div>
      <div class="rpf-info">
        ${photo.title ? `<div class="rpf-title">${escapeHtml(photo.title)}</div>` : ""}
        ${photo.caption ? `<div class="rpf-caption">${escapeHtml(photo.caption)}</div>` : ""}
      </div>
      <span class="rpf-number">${String(index + 1).padStart(2, "0")} / ${total}</span>
    </article>`).join("");
  return `
    <section class="remote-photo-flow" data-flow-index="0" aria-label="动态图片展示">
      <div class="rpf-toolbar">
        <span class="rpf-label">2号流动</span>
        <div class="rpf-controls">
          <button type="button" class="rpf-button rpf-previous" aria-label="上一张图片" disabled>←</button>
          <span class="rpf-position" aria-live="polite">01 / ${total}</span>
          <button type="button" class="rpf-button rpf-next" aria-label="下一张图片"${photos.length === 1 ? " disabled" : ""}>→</button>
        </div>
      </div>
      <div class="rpf-viewport"><div class="rpf-track">${cards}</div></div>
    </section>`;
}

export async function renderRemoteLogMarkdown(body: string): Promise<string> {
  let cursor = 0;
  let output = "";
  for (const match of body.matchAll(marker)) {
    const index = match.index ?? 0;
    output += await marked.parse(body.slice(cursor, index));
    const gallery = parseGallery(match[1]);
    output += gallery.layout === "stack1"
      ? photoStack(gallery.photos)
      : photoFlow(gallery.photos);
    cursor = index + match[0].length;
  }
  output += await marked.parse(body.slice(cursor));
  return output;
}
