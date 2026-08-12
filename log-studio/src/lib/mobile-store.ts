import { getSupabase } from "./supabase";
import type { LogDocument, LogFile, SaveLogInput } from "./types";

interface LogRow {
  path: string;
  content: string;
  updated_at: string;
}

function pseudoSha(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function listMobileLogs(userId: string): Promise<{ files: LogFile[]; folders: string[]; provider: string }> {
  const supabase = getSupabase();
  const [{ data: entries, error: entryError }, { data: folders, error: folderError }] = await Promise.all([
    supabase.from("log_entries").select("path, content, updated_at").eq("owner_id", userId).order("updated_at", { ascending: false }),
    supabase.from("log_folders").select("path").eq("owner_id", userId).order("path"),
  ]);
  if (entryError) throw new Error(entryError.message);
  if (folderError) throw new Error(folderError.message);
  return {
    files: ((entries || []) as LogRow[]).map((row) => ({ path: row.path, name: row.path.split("/").pop() || row.path, sha: pseudoSha(`${row.updated_at}:${row.content}`) })),
    folders: (folders || []).map((row) => row.path),
    provider: "supabase",
  };
}

export async function readMobileLog(path: string, userId: string): Promise<LogDocument> {
  const { data, error } = await getSupabase().from("log_entries").select("path, content, updated_at").eq("owner_id", userId).eq("path", path).single();
  if (error) throw new Error(error.message);
  const row = data as LogRow;
  return { path: row.path, content: row.content, sha: pseudoSha(`${row.updated_at}:${row.content}`) };
}

export async function saveMobileLog(input: SaveLogInput, userId: string, published: boolean): Promise<LogDocument> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("log_entries").upsert({
    path: input.path,
    content: input.content,
    owner_id: userId,
    published,
    updated_at: new Date().toISOString(),
  }, { onConflict: "path" }).select("path, content, updated_at").single();
  if (error) throw new Error(error.message);
  if (input.previousPath && input.previousPath !== input.path) {
    const { error: removeError } = await supabase.from("log_entries").delete().eq("owner_id", userId).eq("path", input.previousPath);
    if (removeError) throw new Error(removeError.message);
  }
  const row = data as LogRow;
  return { path: row.path, content: row.content, sha: pseudoSha(`${row.updated_at}:${row.content}`) };
}

export async function removeMobileLog(path: string, userId: string): Promise<void> {
  const { error } = await getSupabase().from("log_entries").delete().eq("owner_id", userId).eq("path", path);
  if (error) throw new Error(error.message);
}

export async function createMobileFolder(path: string, userId: string): Promise<string> {
  const { error } = await getSupabase().from("log_folders").upsert({ path, owner_id: userId }, { onConflict: "path" });
  if (error) throw new Error(error.message);
  return path;
}
