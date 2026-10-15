// src/data/album/newjourney/index.ts
// NEW JOURNEY —— 详情页直接打开单本翻页书，不再经过书架。
// 内页沿用 src/data/books.ts 中已有的内容。
// 列表封面使用 NEW JOURNEY 自己的视频，并使用 Album 卡片原始的全尺寸展示。
import type { AlbumItem } from "../types";
import { parseAlbumBook } from "../book-format";
import bookSource from "./book.md?raw";

const album: AlbumItem = {
  id: "newjourney",
  title: "NEW JOURNEY",
  year: "2026",
  client: "新路",
  href: "/album/newjourney",
  media: {
    type: "video",
    src: "/videos/newjourney.mp4",
    poster: "",
    fit: "contain",
    effects: false,
  },
  accent: ["#3a4a4a", "#0b1110"],
  order: 1,
  kind: "book",
  pages: parseAlbumBook(bookSource),
};

export default album;
