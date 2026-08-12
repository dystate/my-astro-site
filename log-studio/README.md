# Dystate Log Studio

独立的 Markdown / MDX 日志管理 App。它不会替换现有 Astro 日志网站，而是管理原仓库中的 `src/data/logs/**.{md,mdx}`。

## 已实现

- 文件夹目录树、搜索、新建分类和 Markdown 导入
- CodeMirror 编辑器、安全预览和文章大纲
- frontmatter 表单：标题、日期、分类、标签、草稿、`accent`
- 新建日志时从协调色板随机生成 `accent`，也可随时“换一组”
- Supabase 邮箱密码登录
- Supabase Storage 图片上传，上传后自动插入 Markdown 图片语法
- 开发环境直接读写本地日志，生产环境通过 GitHub Contents API 保存
- 保存、发布、删除、快捷键 `Ctrl/Cmd + S`

“新建分类”会创建真实目录，并写入 `.gitkeep`。因此空分类也能被 Git 记录，部署后不会消失。

## 1. 安装和本地运行

```powershell
cd E:\Astro\log-studio
npm install
Copy-Item .env.example .env
npm run dev
```

本地联调时如果暂时没有 Supabase，可在 `.env` 中同时设置：

```dotenv
PUBLIC_DEV_BYPASS_AUTH=true
DEV_BYPASS_AUTH=true
LOG_CONTENT_PROVIDER=local
LOGS_LOCAL_ROOT=E:/Astro/src/data/logs
```

这些绕过项只能用于本机开发，不得配置到 Vercel。

## 2. 配置 Supabase

1. 在 Supabase Dashboard 创建项目。
2. 在 Authentication 中创建允许进入管理后台的用户。
3. 在 SQL Editor 运行 [`supabase/storage.sql`](./supabase/storage.sql)。
4. 将 Project URL 和 anon/publishable key 写入 `.env`。
5. 用逗号分隔允许登录的邮箱：

```dotenv
LOG_STUDIO_ALLOWED_EMAILS=first@example.com,second@example.com
```

Storage bucket 使用 `log-assets`。对象路径以登录用户 UUID 开头，RLS 只允许用户修改自己的上传；bucket 设为 public，确保发布后的 Markdown 图片 URL 长期可用。

## 3. 配置 GitHub 内容写入

在 GitHub 创建 fine-grained personal access token：

- Repository access：只选择日志网站仓库
- Repository permissions > Contents：Read and write

把 token 只保存在 Vercel 环境变量中：

```dotenv
LOG_CONTENT_PROVIDER=github
GITHUB_TOKEN=github_pat_xxx
GITHUB_REPO_OWNER=dystate
GITHUB_REPO_NAME=my-astro-site
GITHUB_BRANCH=main
GITHUB_LOGS_BASE=src/data/logs
```

浏览器永远不会收到 `GITHUB_TOKEN`。每次保存或发布都会生成 Git commit，随后由现有网站的 Vercel 项目自动部署。

## 4. 部署

在 Vercel 中导入当前仓库，并为 Log Studio 新建第二个 Project：

- Root Directory：`log-studio`
- Framework Preset：Astro
- Build Command：`npm run build`
- 环境变量：按照 `.env.example` 配置，但不要添加任何开发绕过变量

现有网站继续使用仓库根目录部署，两者互不影响。

## 安全提醒

旧站的 `src/components/auth/sign-in-block.tsx` 曾在浏览器代码中硬编码账号密码。上线 Log Studio 前应立即更换这些密码，并删除旧的客户端硬编码登录逻辑。Supabase service-role key 和 GitHub token 均不得使用 `PUBLIC_` 前缀。

## iOS 移动版「蓝笺」

移动端位于同一目录，使用 React + Capacitor，Bundle ID 为 `com.dystate.bluejournal`。UI 是蓝色系的 iOS 日记时间线，支持：

- Supabase 邮箱登录和持久会话
- 日志列表、搜索、分类筛选、新建日志与分类
- Markdown 书写/预览、元数据编辑、随机 accent
- 手机照片上传到 Supabase Storage，并自动插入 Markdown
- 保存/发布直接写入 Supabase `log_entries`，网站 SSR 合并读取，发布后立即可见

本机构建静态资源：

```powershell
cd E:\Astro\log-studio
npm install
npm run mobile:build
```

在 macOS/Xcode 上同步工程：

```bash
npm run mobile:sync
npm run mobile:icon
npm run mobile:open
```

### GitHub 打包 IPA

工作流文件是 `.github/workflows/ios-ipa.yml`。仓库变量：

- `SUPABASE_URL`：Supabase Project URL
- `SUPABASE_PUBLISHABLE_KEY`：Supabase publishable key（不是 service-role）

没有 Apple 签名材料时，Actions 会生成 `BlueJournal-unsigned.ipa`，用于后续自行签名。若要生成可直接安装的签名 IPA，再添加 Secrets：

- `IOS_CERTIFICATE_P12_BASE64`
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISION_PROFILE_BASE64`
- `IOS_TEAM_ID`
- `KEYCHAIN_PASSWORD`

在 GitHub 的 Actions 页面手动运行 `Build Blue Journal IPA` 即可下载产物；推送 `ios-v*` tag 时还会自动附加到 GitHub Release。
