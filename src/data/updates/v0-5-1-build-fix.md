---
version: "v0.5.1"
date: 2026-09-24
kind: fix
title: 修掉几个卡住构建的老问题
summary: 0 字节的空日志文件和没人消费的 woaidan 集合。
changes:
  - type: remove
    text: 下架 MYDAN 页面，导航只留 ALBUM 与 LOGS
  - type: change
    text: 清理 0 字节日志 entry 导致的构建中断
tags:
  - build
---

构建时那条 glob-loader WARN 来自 `woaidan` 集合，它匹配不到任何文件、也没有页面消费。
