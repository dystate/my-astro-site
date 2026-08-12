import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LogDocument, LogTree, SaveLogInput } from "../types";
import { HttpError } from "./auth";

interface ContentStore {
  readonly name: "local" | "github";
  list(): Promise<LogTree>;
  createFolder(folderPath: string): Promise<string>;
  read(logPath: string): Promise<LogDocument>;
  save(input: SaveLogInput): Promise<LogDocument>;
  remove(logPath: string, sha: string | null): Promise<void>;
}

function cleanFolderPath(value: string): string {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* already decoded */ }
  const normalized = decoded.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const segments = normalized.split("/");
  if (
    !normalized
    || normalized.includes("..")
    || segments.some((segment) => !segment || segment === "." || /[<>:"|?*\u0000-\u001f]/.test(segment))
  ) throw new HttpError(400, "分类名称无效");
  return normalized;
}

function cleanLogPath(value: string): string {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* already decoded */ }
  const normalized = decoded.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || !/\.(md|mdx)$/i.test(normalized)) {
    throw new HttpError(400, "日志路径无效");
  }
  return normalized;
}

function contentSha(content: string): string {
  return createHash("sha1").update(content).digest("hex");
}

class LocalContentStore implements ContentStore {
  readonly name = "local" as const;
  private readonly root: string;

  constructor() {
    this.root = path.resolve(process.env.LOGS_LOCAL_ROOT || path.resolve(process.cwd(), "..", "src", "data", "logs"));
  }

  private resolve(logPath: string): { path: string; relative: string } {
    const relative = cleanLogPath(logPath);
    const target = path.resolve(this.root, ...relative.split("/"));
    const rootWithSep = `${this.root}${path.sep}`;
    if (!target.startsWith(rootWithSep)) throw new HttpError(400, "日志路径越界");
    return { path: target, relative };
  }

  private resolveFolder(folderPath: string): { path: string; relative: string } {
    const relative = cleanFolderPath(folderPath);
    const target = path.resolve(this.root, ...relative.split("/"));
    const rootWithSep = `${this.root}${path.sep}`;
    if (!target.startsWith(rootWithSep)) throw new HttpError(400, "分类路径越界");
    return { path: target, relative };
  }

  async list(): Promise<LogTree> {
    const files: LogTree["files"] = [];
    const folders = new Set<string>();
    const walk = async (dir: string) => {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          folders.add(path.relative(this.root, full).split(path.sep).join("/"));
          await walk(full);
        }
        else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
          const content = await readFile(full, "utf8");
          const relative = path.relative(this.root, full).split(path.sep).join("/");
          files.push({ path: relative, name: entry.name, sha: contentSha(content) });
        }
      }
    };
    await walk(this.root);
    return {
      files: files.sort((a, b) => a.path.localeCompare(b.path, "zh-CN")),
      folders: Array.from(folders).sort((a, b) => a.localeCompare(b, "zh-CN")),
    };
  }

  async createFolder(folderPath: string): Promise<string> {
    const target = this.resolveFolder(folderPath);
    await mkdir(target.path, { recursive: true });
    await writeFile(path.join(target.path, ".gitkeep"), "", { encoding: "utf8", flag: "a" });
    return target.relative;
  }

  async read(logPath: string): Promise<LogDocument> {
    const target = this.resolve(logPath);
    try {
      const content = await readFile(target.path, "utf8");
      return { path: target.relative, content, sha: contentSha(content) };
    } catch {
      throw new HttpError(404, "没有找到这篇日志");
    }
  }

  async save(input: SaveLogInput): Promise<LogDocument> {
    const target = this.resolve(input.path);
    await mkdir(path.dirname(target.path), { recursive: true });
    await writeFile(target.path, input.content, "utf8");

    if (input.previousPath && cleanLogPath(input.previousPath) !== target.relative) {
      const previous = this.resolve(input.previousPath);
      await rm(previous.path, { force: true });
    }
    return { path: target.relative, content: input.content, sha: contentSha(input.content) };
  }

  async remove(logPath: string): Promise<void> {
    const target = this.resolve(logPath);
    await rm(target.path, { force: false });
  }
}

interface GitHubContent {
  sha: string;
  content?: string;
  encoding?: string;
}

const utf8Base64 = (value: string): string => Buffer.from(value, "utf8").toString("base64");

class GitHubContentStore implements ContentStore {
  readonly name = "github" as const;
  private readonly token = process.env.GITHUB_TOKEN ?? "";
  private readonly owner = process.env.GITHUB_REPO_OWNER ?? "";
  private readonly repo = process.env.GITHUB_REPO_NAME ?? "";
  private readonly branch = process.env.GITHUB_BRANCH || "main";
  private readonly base = (process.env.GITHUB_LOGS_BASE || "src/data/logs").replace(/^\/+|\/+$/g, "");

  constructor() {
    if (!this.token || !this.owner || !this.repo) throw new HttpError(500, "GitHub 内容源尚未配置完整");
  }

  private headers(): HeadersInit {
    return {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${this.token}`,
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      "user-agent": "dystate-log-studio",
    };
  }

  private fullPath(logPath: string): string {
    return `${this.base}/${cleanLogPath(logPath)}`;
  }

  private encodedContentPath(logPath: string): string {
    return this.encodedRepoPath(this.fullPath(logPath));
  }

  private encodedRepoPath(repoPath: string): string {
    return repoPath.split("/").map(encodeURIComponent).join("/");
  }

  private async github<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, { ...init, headers: { ...this.headers(), ...init?.headers } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload.message === "string" ? payload.message : `GitHub 请求失败 (${response.status})`;
      throw new HttpError(response.status === 404 ? 404 : 502, message);
    }
    return payload as T;
  }

  async list(): Promise<LogTree> {
    const ref = encodeURIComponent(this.branch);
    const data = await this.github<{ tree: Array<{ path: string; type: string; sha: string }> }>(
      `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/git/trees/${ref}?recursive=1`,
    );
    const prefix = `${this.base}/`;
    const files = data.tree
      .filter((entry) => entry.type === "blob" && entry.path.startsWith(prefix) && /\.(md|mdx)$/i.test(entry.path))
      .map((entry) => {
        const relative = entry.path.slice(prefix.length);
        return { path: relative, name: relative.split("/").pop() || relative, sha: entry.sha };
      })
      .sort((a, b) => a.path.localeCompare(b.path, "zh-CN"));
    const folders = data.tree
      .filter((entry) => entry.type === "tree" && entry.path.startsWith(prefix))
      .map((entry) => entry.path.slice(prefix.length))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "zh-CN"));
    return { files, folders };
  }

  async createFolder(folderPath: string): Promise<string> {
    const relative = cleanFolderPath(folderPath);
    const keepPath = this.encodedRepoPath(`${this.base}/${relative}/.gitkeep`);
    await this.github(
      `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${keepPath}`,
      {
        method: "PUT",
        body: JSON.stringify({
          message: `logs: create category ${relative}`,
          content: utf8Base64(""),
          branch: this.branch,
        }),
      },
    );
    return relative;
  }

  async read(logPath: string): Promise<LogDocument> {
    const relative = cleanLogPath(logPath);
    const data = await this.github<GitHubContent>(
      `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${this.encodedContentPath(relative)}?ref=${encodeURIComponent(this.branch)}`,
    );
    if (!data.content || data.encoding !== "base64") throw new HttpError(502, "GitHub 没有返回可编辑内容");
    return {
      path: relative,
      content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"),
      sha: data.sha,
    };
  }

  async save(input: SaveLogInput): Promise<LogDocument> {
    const relative = cleanLogPath(input.path);
    const isMove = Boolean(input.previousPath && cleanLogPath(input.previousPath) !== relative);
    const response = await this.github<{ content: GitHubContent }>(
      `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${this.encodedContentPath(relative)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          message: input.message || `logs: update ${relative}`,
          content: utf8Base64(input.content),
          branch: this.branch,
          ...(!isMove && input.sha ? { sha: input.sha } : {}),
        }),
      },
    );

    if (isMove && input.previousPath) {
      await this.remove(input.previousPath, input.sha ?? null);
    }
    return { path: relative, content: input.content, sha: response.content.sha };
  }

  async remove(logPath: string, sha: string | null): Promise<void> {
    const relative = cleanLogPath(logPath);
    const resolvedSha = sha || (await this.read(relative)).sha;
    if (!resolvedSha) throw new HttpError(409, "无法确定待删除文件的版本");
    await this.github(
      `https://api.github.com/repos/${encodeURIComponent(this.owner)}/${encodeURIComponent(this.repo)}/contents/${this.encodedContentPath(relative)}`,
      {
        method: "DELETE",
        body: JSON.stringify({ message: `logs: delete ${relative}`, sha: resolvedSha, branch: this.branch }),
      },
    );
  }
}

export function getContentStore(): ContentStore {
  const configured = process.env.LOG_CONTENT_PROVIDER?.toLowerCase();
  if (configured === "github" || (!import.meta.env.DEV && configured !== "local")) return new GitHubContentStore();
  return new LocalContentStore();
}
