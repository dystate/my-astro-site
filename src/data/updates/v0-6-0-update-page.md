---
version: "v0.6.0"
date: 2026-10-16
kind: feature
title: 更新日志页上线
summary: 网站有了专门的 changelog，导航也终于只需要改一个地方。
changes:
  - type: add
    text: 新增 /update，按版本号倒序记录每次改动
  - type: add
    text: 抽出 src/data/siteNav.ts，导航链接只定义一次
  - type: remove
    text: 取消 SiteNav / AlbumGallery / MobileMenu / Hero 四处重复硬编码
---

以前加一个页面要同步改四份导航列表，现在往 `SITE_NAV` 里加一行就够了。
更新日志本身也改成 md 维护，一条 md 就是一个版本。
