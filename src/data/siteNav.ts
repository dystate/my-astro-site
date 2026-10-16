// src/data/siteNav.ts
// 全站导航链接的唯一真源。
// 桌面端导航、移动端全屏菜单、首页 Hero 顶栏共用同一份数组；
// 新增页面时只在这里加一条，所有引用处自动同步（design.md 的 DRY 规则）。

export interface NavLink {
  href: string;
  label: string;
  key: string;    // 页面标识，用于给当前页链接加 .active
  accent: string; // 选中 / 悬停时的强调色：ALBUM 蓝、LOGS 黄（取自首页 Logo 的 D / st）、UPDATE 绿
}

export const SITE_NAV: readonly NavLink[] = [
  { href: "/album", label: "ALBUM", key: "album", accent: "#3B82F6" },
  { href: "/logs", label: "LOGS", key: "logs", accent: "#eab308" },
  { href: "/update", label: "UPDATE", key: "update", accent: "#9be014" },
] as const;
