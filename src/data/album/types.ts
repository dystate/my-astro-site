// src/data/album/types.ts
// 相册相关的共享类型。

export type AlbumMedia =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string };

/** 详情页 scroll-linked zoom 轮播里的单张图片 */
export interface AlbumPhoto {
  /** 图片路径；留空则显示渐变占位（之后把你的图片放进 /public 再填这里） */
  src?: string;
  /** 叠在图片上的标题（当前详情页用固定标题，这里仅作备注/alt） */
  title: string;
  /** 可选副标题（年份 / 地点等） */
  caption?: string;
  /** 占位渐变的两个色值（src 为空时使用） */
  accent?: [string, string];
}

export interface AlbumItem {
  id: string;
  title: string;
  year: string;
  client: string;
  /** 列表页封面，不填则用 accent 渐变占位 */
  media?: AlbumMedia;
  href?: string;
  /** 占位渐变的两个色值（替换真实媒体前的兜底外观） */
  accent?: [string, string];
  /** 详情页轮播图集（点进该作品后展示的 scroll-linked zoom 画廊） */
  photos?: AlbumPhoto[];
  /** 列表排序，数字越小越靠前；不填按文件夹名排序 */
  order?: number;
  /** 详情页类型：gallery=滚动缩放画廊（默认）；desk=散落物品桌面 */
  kind?: "gallery" | "desk";
  /** kind==="desk" 时，桌面上散落的可点击物品 */
  desk?: DeskObject[];
}

/* ─────────────── 散落物品桌面（desk） ─────────────── */

/** 点击物品后弹出的内容类型（待具体定义） */
export type DeskAction =
  | { kind: "timeline" } // 时间轴
  | { kind: "toc" }      // 目录
  | { kind: "none" };    // 暂未指定

/** 一本立体的书：封面朝上、有厚度、可歪斜摆放 */
export interface DeskBook {
  type: "book";
  id: string;
  /** 书名（仅作备注/无障碍 alt；视觉以封面图为准） */
  title: string;
  /** 封面图，如 /images/thread.jpg */
  cover: string;
  /** 书的厚度(px)，决定侧边页块的高度，默认 28 */
  thickness?: number;
  /** 封面基准宽度(px)，默认 210 */
  w?: number;
  /** 在桌面中的位置，单位为百分比 0–100（物品中心点） */
  x: number;
  y: number;
  /** 歪斜角度(deg)，默认 0 */
  rotate?: number;
  /** 点击后的动作 */
  action?: DeskAction;
}

/** 桌面物品（目前仅书，之后可扩展：| DeskPhoto | DeskNote …） */
export type DeskObject = DeskBook;
