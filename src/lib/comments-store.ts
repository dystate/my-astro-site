// src/lib/comments-store.ts
// 朋友圈评论存储 —— 服务端文件读写，支持 Vercel SSR
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface Comment {
  id: string;
  postId: string;
  author: string;       // 显示名
  authorEmail: string;  // 登录邮箱
  body: string;
  createdAt: string;    // ISO 时间戳
}

// ── 邮箱 → 显示名映射 ──
const NAME_MAP: Record<string, string> = {
  "dan@woaidan.com": "Dan",
  "ding@woaidan.com": "Ding",
};

export function displayName(email: string): string {
  return NAME_MAP[email] || email.split("@")[0];
}

// ── 存储路径 ──
// Vercel 上项目文件只读，/tmp 可写但跨实例不共享。
// 本地开发写入项目 data 目录（gitignore 掉），生产环境写入 os.tmpdir()。
const isVercel = !!process.env.VERCEL;
const DATA_DIR = path.join(process.cwd(), "src", "data");
const TMP_PATH = isVercel
  ? path.join(os.tmpdir(), "comments.json")
  : path.join(DATA_DIR, "comments-runtime.json");
const SEED_PATH = path.join(DATA_DIR, "comments-seed.json");

function readSeed(): Comment[] {
  try {
    if (fs.existsSync(SEED_PATH)) {
      const raw = fs.readFileSync(SEED_PATH, "utf-8");
      return JSON.parse(raw) as Comment[];
    }
  } catch { /* 忽略 */ }
  return [];
}

function readTmp(): Comment[] {
  try {
    if (fs.existsSync(TMP_PATH)) {
      const raw = fs.readFileSync(TMP_PATH, "utf-8");
      return JSON.parse(raw) as Comment[];
    }
  } catch { /* 忽略 */ }
  return [];
}

function writeTmp(comments: Comment[]): void {
  fs.writeFileSync(TMP_PATH, JSON.stringify(comments, null, 2), "utf-8");
}

// ── 内存缓存（同实例内避免反复读盘）──
let cache: Comment[] | null = null;
let cacheLoaded = false;

function load(): Comment[] {
  if (!cacheLoaded) {
    const seed = readSeed();
    const tmp = readTmp();
    // tmp 里面的条目视为更新的，用 id 去重（后出现的覆盖先出现的）
    const map = new Map<string, Comment>();
    for (const c of seed) map.set(c.id, c);
    for (const c of tmp) map.set(c.id, c);
    cache = Array.from(map.values());
    cacheLoaded = true;
  }
  return cache!;
}

function save(): void {
  if (cache) writeTmp(cache);
}

// ── 公开 API ──

/** 获取某条帖子下的所有评论，按时间升序 */
export function getComments(postId: string): Comment[] {
  return load()
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** 添加一条评论，返回创建好的 Comment */
export function addComment(
  postId: string,
  email: string,
  body: string,
): Comment {
  const all = load();
  const comment: Comment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    postId,
    author: displayName(email),
    authorEmail: email,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  all.push(comment);
  cache = all;
  save();
  return comment;
}

/** 删除一条评论。只有作者本人才能删除。返回 true 表示成功 */
export function deleteComment(commentId: string, email: string): boolean {
  const all = load();
  const idx = all.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;
  if (all[idx].authorEmail !== email) return false; // 不是作者
  all.splice(idx, 1);
  cache = all;
  save();
  return true;
}

/** 获取所有评论总数（用于轮询变化检测） */
export function getCommentCount(postId: string): number {
  return getComments(postId).length;
}
