/**
 * 书本页数据 — 每本书的封面 + 内页（图片 or 文字）
 *
 * 图片请放在 public/images/ 下，写 "/images/xxx.jpg" 即可。
 * 用法：在 src/components/book/Bookshelf.astro 中 import { books } from "../../data/books";
 *      （书架展示在 /album/newjourney）
 */

export interface BookPage {
  /** 整页图片地址（空白页直接变为图片，同 ten 页面效果） */
  image?: string;
  /** 纯文字内容（没有 image 时使用） */
  text?: string;
  /** 页标题（可选，显示在文字页顶部） */
  title?: string;
}

export interface BookData {
  /** 书脊编号（由 Bookshelf 按 order 排序后自动写入，无需手填） */
  id?: number;
  /** 书名（显示在书脊上） */
  name: string;
  /** 书籍详情页 URL 代号（/album/book/<slug>）；不填则用序号 */
  slug?: string;
  /** 书架上的排列顺序（越小越靠左） */
  order?: number;
  /** 封面图片（如 /images/cover.png）；不填则用纯色硬壳封面 */
  cover?: string;
  /** 内页列表 */
  pages: BookPage[];
}

import 愛 from "./woaidan/愛";
import 想说的话 from "./woaidan/想说的话";

export const books: BookData[] = [愛, 想说的话];
