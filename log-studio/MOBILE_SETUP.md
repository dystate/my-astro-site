# 蓝笺 iOS 发布清单

1. 网站 Vercel Project 配置 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`，用于 SSR 读取已发布日志。
2. GitHub Variables 设置 `SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`。
3. 在 GitHub Actions 运行 `Build Blue Journal IPA`。
4. 未配置 Apple Developer 证书时得到 unsigned IPA；配置五个签名 Secrets 后得到 signed IPA。

安全边界：App 内只有 Supabase publishable key。日志和图片写入都由 Supabase 登录 JWT 与 RLS 校验，不会把 GitHub Token 打包进 IPA。
