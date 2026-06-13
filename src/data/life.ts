// src/data/life.ts
// 照片墙数据：照片 + 日记 + 备注
// ─────────────────────────────────────────────────────────────
// 在 life.astro 里：import { lifeEntries } from "../data/life";
// 加照片：复制一条对象，改字段即可。src 指向 /public/images/life/ 下的文件。

/** 图钉颜色，缺省 pearl（珍珠白） */
export type PinColor = "pearl" | "yellow" | "green" | "blue" | "red";

export interface LifeEntry {
  /** 唯一 id，灯箱/锚点用，建议短横线小写 */
  id: string;
  /** 照片路径，如 "/images/life/01.jpg" */
  src: string;
  /** 替代文本 / 无障碍描述 */
  alt: string;
  /** 显示日期，自由格式，如 "31 12月 2025 4:34下午" */
  date: string;
  /** 日记：这张照片背后的一段文字，点开灯箱时显示 */
  diary?: string;
  /** 卡片歪斜角度（度），缺省 0；建议 -4 ~ 4 之间 */
  rot?: number;
  /** 图钉颜色，缺省 "pearl" */
  pin?: PinColor;
}


export const lifeEntries: LifeEntry[] = [
  {
    id: "graduate",
    src: "/images/graduate.jpg",
    alt: "1",
    date: "2026.5.31 中南民族大学",
    diary: "和ann，wxz一起拍照。就是没洗头兴致不高。",
    rot: -2.5,
    pin: "yellow",
  },
];