// src/data/album/types.ts
// 相册相关的共享类型。

export type AlbumMedia =
  | { type: "video"; src: string; poster?: string; fit?: "cover" | "contain"; effects?: boolean }
  | { type: "image"; src: string; fit?: "cover" | "contain"; effects?: boolean }
  | { type: "audio"; src: string; poster?: string; fit?: "cover" | "contain"; effects?: boolean };

export interface AlbumPageMedia {
  type: "image" | "video" | "audio";
  src: string;
  title?: string;
  caption?: string;
}

/** A published page may freely combine text with image, video, and audio. */
export interface AlbumPage {
  id?: string;
  title?: string;
  text?: string;
  media?: AlbumPageMedia[];
}

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
  /** Mixed-media pages created by Life Manager. */
  pages?: AlbumPage[];
  description?: string;
  /** 列表排序，数字越小越靠前；不填按文件夹名排序 */
  order?: number;
  /** 详情页类型：gallery=滚动缩放画廊（默认）；book=直接打开翻页书 */
  kind?: "gallery" | "book";
}
