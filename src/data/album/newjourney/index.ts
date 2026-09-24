// src/data/album/newjourney/index.ts
// NEW JOURNEY —— 详情页是「书架」（kind: "shelf"），沿用原 /woaidan 的书柜 + 翻书阅读器。
// 书本数据在 src/data/books.ts（每本书对应 src/data/woaidan/<书名>.ts）。
// 列表封面仍沿用 /images/eye.mp4。
import type { AlbumItem } from "../types";

const album: AlbumItem = {
  id: "newjourney",
  title: "NEW JOURNEY",
  year: "2026",
  client: "新路",
  href: "/album/newjourney",
  media: { type: "video", src: "/images/eye.mp4", poster: "" },
  accent: ["#3a4a4a", "#0b1110"],
  order: 1,
  kind: "shelf",
};

export default album;
