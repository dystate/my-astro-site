import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import type { EditorView } from "@codemirror/view";
import type { Session } from "@supabase/supabase-js";
import { Check, ChevronRight, CloudUpload, Eye, FilePlus2, ImagePlus, LogOut, Menu, Save, Send, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LoginScreen from "./LoginScreen";
import MetadataBar from "./MetadataBar";
import NewCategoryDialog from "./NewCategoryDialog";
import NewLogDialog from "./NewLogDialog";
import Sidebar from "./Sidebar";
import { createLogFolder, listLogs, readLog, removeLog, saveLog } from "../lib/api";
import { categoryOptionsFromFolders } from "../lib/categories";
import { logMetadataSchema, parseLogDocument, previewableMarkdown, serializeLogDocument } from "../lib/frontmatter";
import { devBypass, getSupabase, storageBucket, supabaseConfigured } from "../lib/supabase";
import type { LogFile, LogMetadata, SaveState, UploadState } from "../lib/types";
import "../styles/studio.css";

type Mode = "edit" | "preview";

function extension(name: string): string {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

function safeUploadName(name: string): string {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function stateLabel(state: SaveState): string {
  if (state === "saving") return "保存中";
  if (state === "dirty") return "未保存";
  if (state === "error") return "保存失败";
  return "已保存";
}

export default function LogStudioApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(devBypass);
  const [authError, setAuthError] = useState("");
  const [files, setFiles] = useState<LogFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [provider, setProvider] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState("随笔");
  const [sha, setSha] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<LogMetadata | null>(null);
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<Mode>("edit");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notice, setNotice] = useState("");
  const [newDialog, setNewDialog] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const token = devBypass ? "dev-bypass" : session?.access_token ?? "";

  useEffect(() => {
    if (devBypass) return;
    if (!supabaseConfigured) {
      setAuthReady(true);
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    }).catch(() => {
      setAuthError("无法读取登录状态");
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshTree = useCallback(async () => {
    if (!token) return [] as LogFile[];
    setTreeLoading(true);
    try {
      const data = await listLogs(token);
      setFiles(data.files);
      setFolders(data.folders);
      setProvider(data.provider);
      return data.files;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "目录读取失败");
      return [] as LogFile[];
    } finally {
      setTreeLoading(false);
    }
  }, [token]);

  const openLog = useCallback(async (path: string) => {
    if (!token) return;
    try {
      setNotice("");
      const document = await readLog(path, token);
      const parsed = parseLogDocument(document.content);
      setSelectedPath(document.path);
      setOriginalPath(document.path);
      setActiveFolder(document.path.split("/").slice(0, -1).join("/"));
      setSha(document.sha);
      setMetadata(parsed.metadata);
      setBody(parsed.body);
      setSaveState("saved");
      setSidebarOpen(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "日志读取失败");
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refreshTree().then((loaded) => {
      if (!selectedPath && loaded[0]) openLog(loaded[0].path);
    });
  }, [token]);

  const dirtyMetadata = (next: LogMetadata) => {
    setMetadata(next);
    setSaveState("dirty");
  };

  const dirtyBody = (next: string) => {
    setBody(next);
    setSaveState("dirty");
  };

  const persist = useCallback(async (options?: { publish?: boolean }) => {
    if (!metadata || !selectedPath || !token) return false;
    const nextMetadata = options?.publish ? { ...metadata, draft: false } : metadata;
    const parsed = logMetadataSchema.safeParse(nextMetadata);
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message || "日志信息不完整");
      return false;
    }
    setSaveState("saving");
    setNotice("");
    try {
      const content = serializeLogDocument(nextMetadata, body);
      const result = await saveLog({
        path: selectedPath,
        content,
        sha,
        previousPath: originalPath && originalPath !== selectedPath ? originalPath : null,
        message: options?.publish ? `logs: publish ${selectedPath}` : `logs: save ${selectedPath}`,
      }, token);
      setSha(result.sha);
      setOriginalPath(result.path);
      setMetadata(nextMetadata);
      setSaveState("saved");
      await refreshTree();
      return true;
    } catch (error) {
      setSaveState("error");
      setNotice(error instanceof Error ? error.message : "保存失败");
      return false;
    }
  }, [metadata, selectedPath, token, body, sha, originalPath, refreshTree]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        persist();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [persist]);

  const createLog = (path: string, nextMetadata: LogMetadata) => {
    let uniquePath = path;
    let index = 2;
    while (files.some((file) => file.path === uniquePath)) {
      uniquePath = path.replace(/\.(md|mdx)$/i, `-${index}.mdx`);
      index += 1;
    }
    setSelectedPath(uniquePath);
    setOriginalPath(null);
    setActiveFolder(uniquePath.split("/").slice(0, -1).join("/"));
    setSha(null);
    setMetadata(nextMetadata);
    setBody(`# ${nextMetadata.title}\n\n`);
    setSaveState("dirty");
    setMode("edit");
    setNewDialog(false);
    setSidebarOpen(false);
  };

  const createCategory = async (path: string): Promise<boolean> => {
    if (!token) return false;
    try {
      setNotice("");
      const result = await createLogFolder(path, token);
      await refreshTree();
      setActiveFolder(result.path);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "分类创建失败");
      return false;
    }
  };

  const importMarkdown = async (file: File) => {
    const source = await file.text();
    const parsed = parseLogDocument(source);
    const basePath = `${activeFolder ? `${activeFolder}/` : ""}${file.name}`;
    let uniquePath = basePath;
    let index = 2;
    while (files.some((item) => item.path === uniquePath)) {
      uniquePath = basePath.replace(/\.(md|mdx)$/i, `-${index}$&`);
      index += 1;
    }
    setSelectedPath(uniquePath);
    setOriginalPath(null);
    setSha(null);
    setMetadata(parsed.metadata);
    setBody(parsed.body);
    setSaveState("dirty");
    setMode("edit");
    setSidebarOpen(false);
  };

  const insertAtCursor = (text: string) => {
    const view = editorRef.current;
    if (!view) {
      dirtyBody(`${body}${body.endsWith("\n") ? "" : "\n"}${text}\n`);
      return;
    }
    const position = view.state.selection.main.head;
    view.dispatch({ changes: { from: position, insert: text }, selection: { anchor: position + text.length } });
    view.focus();
  };

  const uploadImage = async (file: File) => {
    if (!supabaseConfigured || devBypass) {
      setUpload({ status: "error", name: file.name, message: "请配置 Supabase 后再上传图片" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUpload({ status: "error", name: file.name, message: "只能上传图片文件" });
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setUpload({ status: "error", name: file.name, message: "图片不能超过 12MB" });
      return;
    }
    const supabase = getSupabase();
    const userId = session?.user.id;
    if (!userId) return;
    const month = new Date().toISOString().slice(0, 7);
    const objectName = `${crypto.randomUUID()}-${safeUploadName(file.name) || `image${extension(file.name)}`}`;
    const objectPath = `${userId}/${month}/${objectName}`;
    setUpload({ status: "uploading", name: file.name });
    const { error } = await supabase.storage.from(storageBucket).upload(objectPath, file, { cacheControl: "31536000", upsert: false });
    if (error) {
      setUpload({ status: "error", name: file.name, message: error.message });
      return;
    }
    const { data } = supabase.storage.from(storageBucket).getPublicUrl(objectPath);
    const url = data.publicUrl;
    insertAtCursor(`![${file.name.replace(/\.[^.]+$/, "")} ](${url})`.replace(" ]", "]"));
    setUpload({ status: "success", name: file.name, url });
  };

  const deleteCurrent = async () => {
    if (!selectedPath || !originalPath || !token) return;
    if (!window.confirm(`确定删除「${selectedPath}」吗？GitHub 模式下仍可从提交历史恢复。`)) return;
    try {
      await removeLog(originalPath, sha, token);
      const nextFiles = await refreshTree();
      setSelectedPath(null);
      setOriginalPath(null);
      setMetadata(null);
      setBody("");
      if (nextFiles[0]) await openLog(nextFiles[0].path);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "删除失败");
    }
  };

  const headings = useMemo(() => body.split("\n").flatMap((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    return match ? [{ level: match[1].length, text: match[2] }] : [];
  }), [body]);
  const categoryOptions = useMemo(
    () => categoryOptionsFromFolders(folders, metadata?.category),
    [folders, metadata?.category],
  );

  if (!authReady) return <main className="loading-page">正在打开 Log Studio…</main>;
  if (!devBypass && !session) return <LoginScreen initialError={authError} />;

  return (
    <div className="studio-shell">
      <div className={`sidebar-wrap ${sidebarOpen ? "is-open" : ""}`}>
        <Sidebar files={files} folders={folders} selectedPath={selectedPath} activeFolder={activeFolder} provider={provider} loading={treeLoading}
          onSelect={openLog} onFolder={setActiveFolder} onNew={() => setNewDialog(true)} onNewCategory={() => setNewCategoryDialog(true)} onImport={importMarkdown} />
      </div>
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="关闭目录" />}

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="breadcrumb">
            <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="打开目录"><Menu size={19} /></button>
            {selectedPath ? selectedPath.split("/").map((part, index, all) => <span key={`${part}-${index}`}>{part}{index < all.length - 1 && <ChevronRight size={13} />}</span>) : <span>选择一篇日志</span>}
          </div>
          <div className="top-actions">
            <span className={`save-status is-${saveState}`}><i />{stateLabel(saveState)}</span>
            <button className="top-text-button" onClick={() => setMode(mode === "edit" ? "preview" : "edit")} disabled={!metadata}><Eye size={16} />{mode === "edit" ? "预览" : "编辑"}</button>
            <button className="top-text-button" onClick={() => persist()} disabled={!metadata || saveState === "saving"}><Save size={16} />保存</button>
            <button className="publish-button" onClick={() => persist({ publish: true })} disabled={!metadata || saveState === "saving"}><Send size={15} />发布</button>
            <button className="icon-button delete-button" onClick={deleteCurrent} disabled={!originalPath} aria-label="删除日志"><Trash2 size={17} /></button>
            {!devBypass && <button className="icon-button" onClick={() => getSupabase().auth.signOut()} aria-label="退出登录"><LogOut size={17} /></button>}
          </div>
        </header>

        {metadata ? (
          <>
            <MetadataBar metadata={metadata} categoryOptions={categoryOptions} onChange={dirtyMetadata} />
            <section className="workspace">
              <div className="editor-pane">
                <header className="editor-toolbar">
                  <div className="mode-tabs">
                    <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>编辑</button>
                    <button className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>预览</button>
                  </div>
                  <input ref={imageInputRef} type="file" hidden accept="image/*" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadImage(file);
                    event.currentTarget.value = "";
                  }} />
                  <button className="image-upload-button" onClick={() => imageInputRef.current?.click()}><ImagePlus size={16} />上传图片</button>
                </header>
                {mode === "edit" ? (
                  <CodeMirror
                    value={body}
                    height="100%"
                    extensions={[markdown()]}
                    onCreateEditor={(view) => { editorRef.current = view; }}
                    onChange={dirtyBody}
                    basicSetup={{ foldGutter: false, highlightActiveLineGutter: false, highlightActiveLine: false }}
                    className="markdown-editor"
                  />
                ) : (
                  <article className="markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{previewableMarkdown(body)}</ReactMarkdown></article>
                )}
                {upload.status !== "idle" && (
                  <div className={`upload-toast is-${upload.status}`}>
                    {upload.status === "uploading" ? <CloudUpload size={18} /> : upload.status === "success" ? <Check size={18} /> : <X size={18} />}
                    <span><strong>{upload.name}</strong>{upload.status === "uploading" ? "正在上传至 Supabase…" : upload.status === "success" ? "已上传至 Supabase" : upload.message}</span>
                    <button onClick={() => setUpload({ status: "idle" })} aria-label="关闭"><X size={14} /></button>
                  </div>
                )}
              </div>
              <aside className="outline-pane">
                <span>大纲</span>
                {headings.length ? headings.map((heading, index) => <div key={`${heading.text}-${index}`} style={{ paddingLeft: (heading.level - 1) * 12 }}>{heading.text}</div>) : <p>暂无标题</p>}
              </aside>
            </section>
          </>
        ) : (
          <section className="empty-workspace">
            <div><FilePlus2 size={26} /><h1>开始写点什么</h1><p>从左侧选择日志，或者创建一篇新日志。</p><button className="primary-button" onClick={() => setNewDialog(true)}>新建日志</button></div>
          </section>
        )}
        {notice && <div className="notice-bar"><span>{notice}</span><button onClick={() => setNotice("")}><X size={15} /></button></div>}
      </main>
      {newDialog && <NewLogDialog folders={folders} categoryOptions={categoryOptions} initialFolder={activeFolder} onClose={() => setNewDialog(false)} onCreate={createLog} />}
      {newCategoryDialog && <NewCategoryDialog folders={folders} initialParent={activeFolder} onClose={() => setNewCategoryDialog(false)} onCreate={createCategory} />}
    </div>
  );
}
