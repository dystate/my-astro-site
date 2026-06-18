/**
 * 书本页数据 — 每本书的封面 + 内页（图片 or 文字）
 *
 * 图片请放在 public/images/ 下，写 "/images/xxx.jpg" 即可。
 * 用法：在 woaidan.astro 中 import { books } from "../data/books";
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
  /** 书名（显示在书脊上） */
  name: string;
  /** 书架上的排列顺序（越小越靠左） */
  order?: number;
  /** 封面图片（如 /images/cover.png）；不填则用纯色硬壳封面 */
  cover?: string;
  /** 内页列表 */
  pages: BookPage[];
}

import 故事线 from "./woaidan/故事线";
import 想说的话 from "./woaidan/想说的话";

export const books: BookData[] = [故事线, 想说的话];
