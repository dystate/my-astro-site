// src/data/album.ts
// album 页面的作品数据。把 media 换成你 R2 上的真实视频/图片即可。

export type AlbumMedia =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string };

export interface AlbumItem {
  id: string;
  title: string;
  year: string;
  client: string;
  /** 不填则用 accent 渐变占位 */
  media?: AlbumMedia;
  href?: string;
  /** 占位渐变的两个色值（替换真实媒体前的兜底外观） */
  accent?: [string, string];
}

export const ALBUM_ITEMS: AlbumItem[] = [
  {
    id: "deviate",
    title: "NEW JOURNEY",
    year: "2026",
    client: "新路",
    href: "/album/",
    media: { type: "video", src: "/images/eye.mp4", poster: "" },
    accent: ["#3a4a4a", "#0b1110"],
  },
];
