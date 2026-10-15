// src/data/album/newjourney/index.ts
// NEW JOURNEY —— 详情页直接打开单本翻页书，不再经过书架。
// 内页沿用 src/data/books.ts 中已有的内容。
// 列表封面使用 NEW JOURNEY 自己的视频，并使用 Album 卡片原始的全尺寸展示。
import type { AlbumItem } from "../types";

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
  pages: [
    {
      id: "newjourney-page-image",
      media: [
        {
          type: "image",
          src: "/images/gsx-01.png",
        },
      ],
    },
    {
      id: "newjourney-page-letter",
      text: "以前不懂那些情侣就分开一下下有什么好哭的。但刚刚躺下发现床上只有自己一个人，感觉自己的身体直接被孤独感填满了…眼泪就这么留下来。\n\n好想我的女朋友。我感觉二十天我都受不了，我完蛋了，真的。",
    },
  ],
};

export default album;
