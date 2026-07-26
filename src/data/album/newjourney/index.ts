// src/data/album/newjourney/index.ts
// NEW JOURNEY —— 详情页是「散落物品的桌面」（kind: "desk"），不是滚动画廊。
// 列表封面仍沿用 /images/eye.mp4。
//
// 往桌面上加物品：在下面 desk[] 里追加一个对象即可。
//   · 位置 x / y 是百分比（0–100），表示物品中心点在桌面中的位置。
//   · rotate 是歪斜角度；thickness 是书的厚度；w 是封面基准宽度(px)。
//   · action 是点击后的动作（timeline 时间轴 / toc 目录 / none 待定）。
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
  kind: "desk",
  desk: [
    {
      type: "book",
      id: "storyline",
      title: "故事线",
      cover: "/images/thread.jpg",
      thickness: 30,
      w: 230,
      x: 50,
      y: 50,
      rotate: -8,
      action: { kind: "none" }, // 待定：timeline / toc
    },
  ],
};

export default album;
