import YAML from "yaml";
import { z } from "zod";
import { randomAccent } from "./accents";
import type { LogMetadata, ParsedLog } from "./types";

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);

export const logMetadataSchema = z.looseObject({
  title: z.string().trim().min(1, "请填写标题"),
  date: z.string().trim().min(1, "请选择日期"),
  category: z.string().trim().min(1, "请填写分类"),
  summary: z.string().default(""),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  accent: z.tuple([hexColor, hexColor]),
  motif: z.string().default(""),
  draft: z.boolean().default(true),
});

function dateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function defaultMetadata(title = "未命名日志"): LogMetadata {
  return {
    title,
    date: new Date().toISOString().slice(0, 10),
    category: "essay",
    summary: "",
    tags: [],
    accent: randomAccent(),
    motif: "LOG",
    draft: true,
  };
}

export function parseLogDocument(source: string): ParsedLog {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { metadata: defaultMetadata(), body: normalized };

  let raw: Record<string, unknown> = {};
  try {
    const parsed = YAML.parse(match[1]);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) raw = parsed;
  } catch {
    // Keep the body editable even when imported frontmatter is malformed.
  }

  const fallback = defaultMetadata(typeof raw.title === "string" ? raw.title : undefined);
  const accent = Array.isArray(raw.accent) && raw.accent.length === 2
    ? [String(raw.accent[0]), String(raw.accent[1])]
    : fallback.accent;

  const metadata: LogMetadata = {
    ...raw,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : fallback.title,
    date: dateString(raw.date),
    category: typeof raw.category === "string" && raw.category.trim() ? raw.category : fallback.category,
    summary: typeof raw.summary === "string" ? raw.summary : "",
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
    cover: typeof raw.cover === "string" ? raw.cover : undefined,
    accent: accent as [string, string],
    motif: typeof raw.motif === "string" ? raw.motif : "LOG",
    draft: typeof raw.draft === "boolean" ? raw.draft : false,
  };

  return { metadata, body: normalized.slice(match[0].length) };
}

export function serializeLogDocument(metadata: LogMetadata, body: string): string {
  const clean: Record<string, unknown> = { ...metadata };
  if (!clean.cover) delete clean.cover;
  const yaml = YAML.stringify(clean, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n\n${body.replace(/^\s+/, "")}`;
}

export function previewableMarkdown(body: string): string {
  return body
    .replace(/^import\s.+?;?\s*$/gm, "")
    .replace(/^export\s+(?:const|let|var|function|class)\s[\s\S]*?(?=\n\n|$)/gm, "")
    .replace(/<PhotoStack[\s\S]*?\/>/g, "\n> 图片组将在发布后的文章中显示。\n");
}

export function slugifyFileName(input: string): string {
  return input
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "") || "untitled";
}
