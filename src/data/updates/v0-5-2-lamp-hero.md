---
version: "v0.5.2"
date: 2026-09-29
kind: design
title: 首页换成拉绳台灯
summary: 桌面和移动端共用同一盏灯，点拉绳开灯关灯。
changes:
  - type: add
    text: LampHero —— 拉绳台灯，桌面 + 移动共用一套
  - type: change
    text: Noto Sans SC 引入 700 字重，中文大字用粗体
  - type: remove
    text: 删除 constellation / serene / beam / saturn 等旧 Hero 样式
---

旧 Hero 的四种视觉样式全部下线，`global.css` 里对应的代码块也一并清掉了。
