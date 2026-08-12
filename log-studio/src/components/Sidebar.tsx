import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen, FolderPlus, Import, Plus, Search } from "lucide-react";
import type { LogFile } from "../lib/types";

interface TreeNode {
  name: string;
  path: string;
  folders: Map<string, TreeNode>;
  files: LogFile[];
}

function ensureFolder(root: TreeNode, folderPath: string): TreeNode {
  let current = root;
  for (const part of folderPath.split("/").filter(Boolean)) {
    const nodePath = current.path ? `${current.path}/${part}` : part;
    if (!current.folders.has(part)) current.folders.set(part, { name: part, path: nodePath, folders: new Map(), files: [] });
    current = current.folders.get(part)!;
  }
  return current;
}

function buildTree(files: LogFile[], knownFolders: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", folders: new Map(), files: [] };
  for (const folder of knownFolders) ensureFolder(root, folder);
  for (const file of files) {
    const parts = file.path.split("/");
    const fileName = parts.pop()!;
    const current = ensureFolder(root, parts.join("/"));
    current.files.push({ ...file, name: fileName });
  }
  return root;
}

interface Props {
  files: LogFile[];
  folders: string[];
  selectedPath: string | null;
  activeFolder: string;
  provider: string;
  loading: boolean;
  onSelect: (path: string) => void;
  onFolder: (path: string) => void;
  onNew: () => void;
  onNewCategory: () => void;
  onImport: (file: File) => void;
}

export default function Sidebar({ files, folders, selectedPath, activeFolder, provider, loading, onSelect, onFolder, onNew, onNewCategory, onImport }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(files.map((file) => file.path.split("/").slice(0, -1).join("/"))));
  const inputRef = useRef<HTMLInputElement>(null);
  const tree = useMemo(() => buildTree(files, folders), [files, folders]);
  const matches = useMemo(() => query.trim()
    ? files.filter((file) => file.path.toLowerCase().includes(query.trim().toLowerCase()))
    : [], [files, query]);

  useEffect(() => {
    if (!activeFolder) return;
    setExpanded((current) => {
      const next = new Set(current);
      const parts = activeFolder.split("/");
      for (let index = 1; index <= parts.length; index += 1) next.add(parts.slice(0, index).join("/"));
      return next;
    });
  }, [activeFolder, folders]);

  const toggle = (path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
    onFolder(path);
  };

  const renderNode = (node: TreeNode, depth = 0): React.ReactNode => (
    <>
      {Array.from(node.folders.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-CN")).map((folder) => {
        const open = expanded.has(folder.path);
        return (
          <div key={folder.path}>
            <button className={`tree-row folder-row ${activeFolder === folder.path ? "is-folder-active" : ""}`} style={{ paddingLeft: 14 + depth * 18 }} onClick={() => toggle(folder.path)}>
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {open ? <FolderOpen size={17} /> : <Folder size={17} />}
              <span>{folder.name}</span>
            </button>
            {open && renderNode(folder, depth + 1)}
          </div>
        );
      })}
      {node.files.sort((a, b) => a.name.localeCompare(b.name, "zh-CN")).map((file) => (
        <button key={file.path} className={`tree-row file-row ${selectedPath === file.path ? "is-selected" : ""}`} style={{ paddingLeft: 34 + depth * 18 }} onClick={() => onSelect(file.path)}>
          <FileText size={16} />
          <span>{file.name}</span>
        </button>
      ))}
    </>
  );

  return (
    <aside className="studio-sidebar">
      <header className="sidebar-header">
        <div><strong>Logs</strong><span>{String(files.length).padStart(2, "0")}</span></div>
        <div className="sidebar-actions">
          <button className="new-button" onClick={onNewCategory} title="新建分类"><FolderPlus size={16} /> 分类</button>
          <button className="new-button" onClick={onNew}><Plus size={17} /> 日志</button>
        </div>
      </header>
      <label className="search-field">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索日志…" />
      </label>
      <nav className="file-tree" aria-label="日志目录">
        {loading ? <p className="sidebar-note">正在读取目录…</p> : query.trim()
          ? matches.map((file) => (
            <button key={file.path} className={`tree-row search-result ${selectedPath === file.path ? "is-selected" : ""}`} onClick={() => onSelect(file.path)}>
              <FileText size={16} /><span>{file.path}</span>
            </button>
          ))
          : renderNode(tree)}
        {!loading && files.length === 0 && <p className="sidebar-note">还没有日志，创建第一篇吧。</p>}
      </nav>
      <footer className="sidebar-footer">
        <input ref={inputRef} hidden type="file" accept=".md,.mdx,text/markdown" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.currentTarget.value = "";
        }} />
        <button className="import-button" onClick={() => inputRef.current?.click()}><Import size={18} /> 导入 Markdown</button>
        <span className="provider-dot"><i /> 内容源：{provider || "—"}</span>
      </footer>
    </aside>
  );
}
