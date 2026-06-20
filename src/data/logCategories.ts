// src/data/logCategories.ts
// 每个分类的左侧介绍。title 用 "*" 分隔：前半 Instrument Serif，后半 Open Sans 800（参考图那种混排）。
// 顺序即页面上 showcase 行的顺序；没有文章的分类自动跳过。

export interface LogCategory {
  slug: string;   // 对应日志 frontmatter 的 category
  title: string;  // 形如 "代码与构建的*持续记录"
  blurb: string;  // 衬线介绍段
}

export const LOG_CATEGORIES: LogCategory[] = [
  {
    slug: "dev",
    title: "代码与构建的*持续记录",
    blurb: "把 Dystate 一砖一瓦搭起来：踩过的坑、重构的取舍、偶尔的灵光一现，按时间顺序留在这里。",
  },
  {
    slug: "design",
    title: "质感与*秩序的笔记",
    blurb: "颜色、字体、动效曲线，以及把它们写成 design.md 规矩的尝试。",
  },
];
