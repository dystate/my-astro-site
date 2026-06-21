# Dystate 设计系统

## 概述

Dystate 是一个以**新粗野主义 (Neo-Brutalism)** 为核心设计语言的个人网站，融合了工业/打字机风格的美学与像素艺术、3D 动画和沉浸式交互。整个站点刻意避免柔和的圆角和模糊阴影，转而使用硬边、实色偏移阴影、点阵网格和手工感的细节（如图钉、胶带、轻微旋转）。

---

## 视觉识别

### 核心理念

- **粗野主义至上**: 3px–4px 纯黑边框，实色偏移阴影，无模糊
- **手工感**: 图钉（红/蓝/黄）、透明胶带、轻微旋转（`-2deg` ~ `2deg`）
- **工业质感**: 等宽字体作为默认，点阵背景，打字机风格排版
- **像素艺术**: 16×16 像素头像，像素风格的视觉点缀
- **压迫与释放**: 悬停时元素向阴影方向下沉（`translate(3px, 3px)`），阴影同时缩小，模拟物理按压

### 标志

标志 "Dystate" 统一为单色呈现，无下划线。首页为特殊处理：**D** 为蓝色，**st** 为黄色，其余字母在亮色模式下为黑色可见，暗色模式下融入背景。

| 字母 | 颜色 |
|------|------|
| **D** | 蓝色 `#2563eb` |
| **y** | 亮色：`#000` / 暗色：融入背景 |
| **st** | 黄色 `#eab308` |
| **ate** | 亮色：`#000` / 暗色：融入背景 |

各页面 Logo 均为纯色链接，hover 时变为 `#5451f2`（紫蓝）。首页 Logo 位于像素头像下方居中，其余页面在各自导航位置。

---

## 色彩系统

使用 **OKLCH** 色彩空间，通过 CSS 自定义属性定义语义化颜色令牌，支持亮/暗模式无缝切换。

### 亮色模式（默认）

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--background` | `oklch(1 0 0)` | 页面背景（白） |
| `--foreground` | `oklch(0.145 0 0)` | 主文本色（近黑） |
| `--primary` | `oklch(0.205 0 0)` | 主色调 |
| `--primary-foreground` | `oklch(0.985 0 0)` | 主色上的文本 |
| `--secondary` | `oklch(0.97 0 0)` | 次要背景 |
| `--muted` | `oklch(0.97 0 0)` | 柔和背景 |
| `--muted-foreground` | `oklch(0.556 0 0)` | 柔和文本 |
| `--accent` | `oklch(0.97 0 0)` | 强调背景 |
| `--border` | `oklch(0.922 0 0)` | 边框色 |
| `--destructive` | `oklch(0.577 0.245 27.325)` | 错误/删除（红） |

### 暗色模式（`.dark` 类触发）

| 令牌 | 色值 |
|------|------|
| `--background` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.985 0 0)` |
| `--primary` | `oklch(0.922 0 0)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` |

### 全局强调色

部分页面使用硬编码颜色来覆盖主题系统，营造特定的情绪氛围：

| 色系 | 色值 | 使用场景 |
|------|------|----------|
| **蓝色** | `#2563eb`, `#3B82F6`, `#5451f2`, `#60a5fa` | 链接、克莱因蓝看板、登录角色 |
| **绿色** | `#16a34a`, `#22c55e`, `#4ade80`, `#9be014` | 成功状态、标志字母 |
| **红色/粉色** | `#ef4444`, `#ff5c39`, `#d81e8f` | 错误、强调、图钉 |
| **黄色** | `#facc15`, `#eab308`, `#ffe14d`, `#f4c20d` | 便签纸背景、标志字母、图钉 |
| **橙色** | `#FF9B6B`, `#e0552b` | 登录角色、温暖强调 |
| **深色背景** | `#2d2e36`, `#f0f0f0`, `#e5e5e5`, `#e9e7e0` | 各页面独立背景色 |

### 图表颜色

`--chart-1` 到 `--chart-5` 按照由浅到深的顺序排列（`oklch(0.87 0 0)` → `oklch(0.269 0 0)`）。

---

## 排版

### 字体栈

| 用途 | 字体 | 加载方式 |
|------|------|----------|
| **主字体 (无衬线)** | Geist Variable | `@fontsource-variable/geist` |
| **粗野主义/代码** | "Courier Prime", ui-monospace, monospace | 系统字体 |
| **终端风格** | VT323 | Google Fonts |
| **中文衬线** | "Noto Serif SC", "Songti SC", serif | 系统字体 |
| **英文衬线** | Georgia | 系统字体 |
| **系统后备** | "Helvetica Neue", "Segoe UI", "PingFang SC", system-ui | 系统字体 |

### 排版规则

- **响应式字号**: 使用 `clamp()` 实现流式缩放（如 `clamp(2rem, 6vw, 3.25rem)`）
- **大写**: 菜单项、导航标签、按钮文字普遍使用 `text-transform: uppercase`
- **字母间距**: 标题和导航使用宽松间距（`0.12em`, `0.15em`, `0.3em`）
- **粗野主义组件**: 默认使用等宽字体，营造打字机/工业风格

---

## 边框与圆角

### 半径令牌

基础半径 `--radius: 0.625rem`（10px），缩放变体如下：

| 令牌 | 缩放比例 | 近似值 |
|------|----------|--------|
| `--radius-sm` | 0.6× | 6px |
| `--radius-md` | 0.8× | 8px |
| `--radius-lg` | 1× | 10px |
| `--radius-xl` | 1.4× | 14px |
| `--radius-2xl` | 1.8× | 18px |
| `--radius-3xl` | 2.2× | 22px |
| `--radius-4xl` | 2.6× | 26px |

### 两种圆角策略

1. **粗野主义组件**: `border-radius: 0` 或 `2px`，保持硬边、工业感
2. **shadcn/现代 UI 组件**: 使用上述半径令牌（`rounded-lg` 按钮，`rounded-xl` 模态框）

### 边框

- 粗野主义组件: `3px–4px solid #000`
- 现代 UI 组件: `1px solid var(--border)`
- 对焦环: `ring-2 ring-ring ring-offset-2 ring-offset-background`

---

## 阴影

### 粗野主义阴影（核心识别特征）

```css
/* 标准阴影 */
box-shadow: 6px 6px 0 0 #000;
box-shadow: 10px 10px 0 0 #000;

/* 悬停按压效果 */
/* 默认: */ box-shadow: 6px 6px 0 0 #000; transform: translate(0, 0);
/* 悬停: */ box-shadow: 3px 3px 0 0 #000; transform: translate(3px, 3px);
/* 过渡: */ transition: all 120ms ease;
```

关键规则：**从不使用模糊半径**——阴影始终保持 `0` 的模糊值，这是新粗野主义的核心特征。

### 现代 UI 阴影

shadcn 组件使用分层阴影（如 `shadow-xl`, `shadow-2xl`），但这是待办事项页面等少数组件的特例，不代表整体风格。

---

## 背景纹理

### 点阵网格

粗野主义页面的标志性背景图案：

```css
background-image: radial-gradient(#000 1px, transparent 1px);
background-size: 22px 22px;
```

应用于告示板、菜单页和日志页面。

### SVG 噪声纹理

使用 SVG `feTurbulence` 分形噪声生成程序化颗粒背景（`NoiseField.astro`），叠加在日志等页面上。

---

## 间距与布局

### 容器宽度

| 令牌 | 值 |
|------|-----|
| `max-w-3xl` | 768px |
| `max-w-4xl` | 896px |
| `max-w-5xl` | 1024px |
| 自定义 | 920px |

### 响应式内边距

```css
padding: clamp(1.5rem, 4vw, 4rem);
padding: clamp(22px, 3.5vw, 46px);
```

### 网格系统

| 页面 | 布局方式 |
|------|----------|
| 告示板 | CSS Grid `grid-template-columns: 1.7fr 1fr` |
| 照片墙 | CSS Multi-column `column-count: 3` ~ `4` |
| 日志列表 | Auto-fill `repeat(auto-fill, minmax(340px, 1fr))` |
| 首页 | Flexbox 居中堆叠 |

---

## 响应式断点

| 断点 | 适用设备 | 行为 |
|------|----------|------|
| `≤ 440px` | 小屏手机 | 单列布局，堆叠 |
| `≤ 650–760px` | 平板 | 网格转单列，减小的阴影和内边距 |
| `≥ 860px` | 桌面 | 完整多列布局，双页翻书 |
| `≥ 1280px` | 宽屏 | 照片墙增至 4 列 |

常用断点: `440px`, `600px`, `650px`, `700px`, `760px`, `860px`。

---

## 组件系统

### UI 组件（shadcn/ui + Radix）

基于 Radix UI 原语，使用 `class-variance-authority` (CVA) 实现变体，`data-*` 属性驱动状态。包括 Button（5 变体 × 8 尺寸）、Card（3 变体 × 4 尺寸）、Dialog（动画模态框）、Input（带图标/密码切换/可清除）、Label（3 变体 × 3 尺寸，必填/选填标记）、Checkbox（SVG 动画勾选）。

### 粗野主义组件

| 组件 | 用途 |
|------|------|
| **Paper** | 通用粗野主义卡片容器：实色偏移阴影、图钉（红/蓝/黄）或透明胶带、轻微随机旋转、按压悬停效果 |
| **StackingCard** | 全屏粘性卡片，滚动驱动堆叠和缩放效果（`targetScale = 1 - (n - i) × 0.05`），顶部色条，实色阴影。菜单页使用，含 4 张导航卡片 |
| **BulletinBoard** | 告示板容器，点阵网格背景，10px 实色阴影，CSS 变量令牌 |

### 沉浸式/3D 组件

| 组件 | 技术 | 用途 |
|------|------|------|
| **DottedSurface** | Three.js（原生） | 40×60 点阵网格，正弦波高度动画，尊重 `prefers-reduced-motion` |
| **FlipBook** | StPageFlip | 3D 翻书效果，硬壳封面/封底，软内页，自动单/双页布局 |
| **AnimatedLogin** | React + Motion | 四角色（紫/黑/橙/黄），瞳孔跟随鼠标，随机眨眼，密码聚焦时移开视线 |

---

## 导航系统

### 核心规则：DRY —— 链接只定义一次

桌面端导航和移动端全屏菜单**共享同一份链接数据**，通过 `<SiteNav />` 组件渲染。**禁止在页面中分别硬编码两份相同的 `<a>` 标签。**

### SiteNav 组件

```
src/components/SiteNav.astro
```

| Prop | 类型 | 说明 |
|------|------|------|
| `current` | `string` | 当前页面标识（`"logs"` / `"album"` / `"woaidan"`），自动给对应链接加 `.active` 类 |
| `class` | `string` | 可选，附加到每个 `<a>` 的 CSS 类名 |

组件内部定义了唯一的链接数组 `LINKS`，添加新页面时**只在这里加一条**，所有引用页面自动同步。

### 使用模式

```astro
<!-- 桌面端导航 -->
<nav class="site-nav" aria-label="导航">
  <SiteNav current="logs" />
</nav>

<!-- 移动端全屏菜单 —— 同一个组件，不重复定义链接 -->
<nav>
  <SiteNav current="logs" />
</nav>
```

### 样式

桌面端和移动端的 `<a>` 样式差异通过**父级选择器**控制（如 `.logs-nav a` vs `.m-menu nav a`），`SiteNav` 本身不包含任何样式，完全由页面 CSS 决定。

### 现有导航链接

| 路径 | 标签 | 标识 |
|------|------|------|
| `/album` | ALBUM | `album` |
| `/logs` | LOGS | `logs` |
| `/woaidan` | MYDAN | `woaidan` |

### 菜单交互（vanilla JS）

移动端菜单的开关逻辑（`menu-open` / `menu-close` / `Escape` 关闭 / 导航后关闭）各页面通过 `<script is:inline>` 实现，不封装为组件——因为不同页面的菜单结构细节可能不同（如 `logs.astro` 和 `woaidan.astro` 的菜单 top-bar 布局略有差异），但交互逻辑保持一致。

---

## 动画与动效

### 交互效果

- **按压悬停**: 120ms–220ms `ease` 过渡，元素向阴影方向平移，阴影同时缩小
- **悬停缩放**: 非粗野主义元素使用温和的 `scale(1.02)` ~ `scale(1.05)`

### 滚动动画

- **Lenis 平滑滚动**: 全局启用
- **堆叠卡片**: 使用 `useScroll` / `useTransform`，按滚动进度缩放和堆叠
- **固定头部**: 多个页面使用 `position: fixed; top: 0; z-index: 50`

### 3D 动画

- **点阵波浪**: 每帧更新，沿 X 和 Z 轴正弦波动
- **翻书**: 800ms 翻页动画，带阴影和 3D 透视，闲置时 6.5s 摇摆微动

### 入口/出场

- 待办事项项以 `popIn` 关键帧动画进入（400ms `cubic-bezier`）
- 灯箱 180ms `ease-in` 淡入
- shadcn 组件使用 `data-open:animate-in` / `data-closed:animate-out`

### 无障碍

所有动画通过 `@media (prefers-reduced-motion: reduce)` 查询禁用，尊重用户的系统偏好。

---

## 亮/暗模式

通过 `.dark` CSS 类切换，OKLCH 语义令牌实现平滑过渡。首页顶部设有主题切换开关（粗野主义风格按钮），状态保存至 `localStorage`，刷新后保持。但许多粗野主义页面使用**硬编码背景色**来保持特定的美学氛围，不受主题切换影响（如 `/me` 使用 `#2d2e36`，`/life` 使用 `#2d2e36`）。

首页暗色模式背景为 `#1a1a1a`，Logo 中非强调字母（y/ate）在暗色模式下融入背景，仅 D（蓝）和 st（黄）可见。

---

## 各页面风格速查

| 页面 | 路径 | 背景色 | 核心特征 |
|------|------|--------|----------|
| 首页 | `/` | `#f0f0f0`（亮）/ `#1a1a1a`（暗） | 3D 点阵波浪、像素头像、主题切换开关、双色 Logo、标语气泡、支持亮/暗模式 |
| 菜单 | `/menu` | `#e5e5e5` | 堆叠粘性卡片、滚动缩放、渐变文字页脚、纯文本 Logo |
| 关于我 | `/me` | `#2d2e36` | 告示板布局、点阵网格、10px 阴影、图钉 |
| 生活 | `/life` | `#2d2e36` | 拍立得白色卡片、CSS 多列布局、灯箱 |
| 日志 | `/logs` | `#000` | 深色 CRT 主题、横滑卡片展示、分类列表覆盖层、单篇文章动态路由 |
| 书架 | `/woaidan` | 白色 + 点阵 | VHS 磁带风格书脊（11 色）、3D 翻书、自定义音视频播放器、登录验证 |
| 待办 | `/xzds` | `#f0f2f5` | 双栏看板：奶油黄 + 克莱因蓝、圆角卡片 |

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Astro（SSR，适配 Vercel） | v6 |
| 前端库 | React | 19 |
| 类型检查 | TypeScript | 5 |
| CSS 框架 | Tailwind CSS | v4 |
| 组件库 | shadcn/ui (radix-nova) | — |
| 原语 | Radix UI | — |
| 动画 | motion (framer-motion) | v12 |
| 平滑滚动 | Lenis | — |
| 3D | Three.js + @react-three/fiber + @react-three/drei | — |
| 翻书 | page-flip (StPageFlip) | — |
| 图标 | lucide-react | — |
| 字体 | Geist Variable | — |
| CSS 动画 | tw-animate-css | — |

---

## 设计原则总结

1. **粗野主义为核心**：硬边框、实色阴影、无模糊、等宽字体
2. **手工感不完美**：图钉、胶带、轻微旋转、看似随机的布局
3. **交互即反馈**：每次悬停都是"按压"，每次点击都有实感
4. **技术服务于氛围**：Three.js 点阵、SVG 噪声、翻书效果——所有技术选择都服务于粗野主义美学
5. **尊重用户偏好**：`prefers-reduced-motion`、响应式布局、明暗模式
6. **混合美学**：粗野主义用于个人内容；现代圆角 UI 仅用于功能性工具页面（待办看板）
