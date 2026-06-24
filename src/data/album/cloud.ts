// src/data/album/cloud.ts
// 图片基地址 + 短键解析。换存储只改这里。
//
// 当前：本地存储模式 —— 图片放在 public/photos/<相册名>/ 下，按 /public 静态资源伺服。
// 将来要上云：把基地址改成你的云加速域名即可（其余结构/组件都不用动）：
//   · 直接改下面的默认值，例如 "https://cdn.dstnb.top"；或
//   · 在项目根目录 .env 写 PUBLIC_PHOTO_BASE=https://你的域名 来覆盖（不改代码）。

export const PHOTO_BASE = (
  (import.meta.env.PUBLIC_PHOTO_BASE as string | undefined) || "/photos"
).replace(/\/$/, "");

/**
 * 把 photos[].src / media.src 的写法解析成完整地址：
 *  - 留空            → undefined（显示占位渐变）
 *  - "http(s)://..." → 原样使用（已是完整地址）
 *  - "/..." 开头     → 当作本地/绝对路径，原样使用（如 /images/eye.mp4）
 *  - "01.jpg" 等裸键 → 解析为 <基地址>/<相册名>/01.jpg
 *      · 本地模式：/photos/newjourney/01.jpg（即 public/photos/newjourney/01.jpg）
 *      · 云模式：  https://你的域名/newjourney/01.jpg
 */
export function resolvePhotoSrc(albumId: string, src?: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return src;
  return `${PHOTO_BASE}/${albumId}/${src}`;
}
