export interface LogFile {
  path: string;
  name: string;
  sha: string | null;
}

export interface LogDocument {
  path: string;
  content: string;
  sha: string | null;
}

export interface LogTree {
  files: LogFile[];
  folders: string[];
}

export interface LogMetadata {
  title: string;
  date: string;
  category: string;
  summary: string;
  tags: string[];
  cover?: string;
  accent: [string, string];
  motif: string;
  draft: boolean;
  [key: string]: unknown;
}

export interface ParsedLog {
  metadata: LogMetadata;
  body: string;
}

export interface SaveLogInput {
  path: string;
  content: string;
  sha?: string | null;
  previousPath?: string | null;
  message?: string;
}

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; name: string }
  | { status: "success"; name: string; url: string }
  | { status: "error"; name: string; message: string };
