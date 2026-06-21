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
    slug: "summary",
    title: "很会偷懒的*年度总结",
    blurb: "来看看这一年我都干了什么吧！",
  },
  {
    slug: "essay",
    title: "胡乱瞎写的*随笔",
    blurb: "我是怎样一个人？",
  },
];
