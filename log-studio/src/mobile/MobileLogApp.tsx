import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft, BookOpen, CalendarDays, Check, ChevronDown, CloudUpload, FolderPlus,
  ImagePlus, LogOut, MoreHorizontal, Plus, RefreshCw, Search, Send, Settings,
  SlidersHorizontal, Trash2, X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LoginScreen from "../components/LoginScreen";
import NewCategoryDialog from "../components/NewCategoryDialog";
import NewLogDialog from "../components/NewLogDialog";
import { categoryOptionsFromFolders } from "../lib/categories";
import { randomAccent } from "../lib/accents";
import { logMetadataSchema, parseLogDocument, previewableMarkdown, serializeLogDocument } from "../lib/frontmatter";
import { getSupabase, storageBucket, supabaseConfigured } from "../lib/supabase";
import { createMobileFolder, listMobileLogs, readMobileLog, removeMobileLog, saveMobileLog } from "../lib/mobile-store";
import type { LogFile, LogMetadata, SaveState, UploadState } from "../lib/types";

type Screen = "journal" | "editor" | "settings";
type EditorMode = "write" | "preview";

function safeUploadName(name: string): string {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function compactDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", weekday: "short" }).format(date);
}

function excerpt(markdown: string): string {
  return markdown
    .replace(/^import\s.+$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/[#>*_`~\[\]()\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

export default function MobileLogApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [files, setFiles] = useState<LogFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [provider, setProvider] = useState("");
  const [screen, setScreen] = useState<Screen>("journal");
  const [editorMode, setEditorMode] = useState<EditorMode>("write");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState("随笔");
  const [sha, setSha] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<LogMetadata | null>(null);
  const [body, setBody] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notice, setNotice] = useState("");
  const [newDialog, setNewDialog] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const [previews, setPreviews] = useState<Record<string, { metadata: LogMetadata; excerpt: string }>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const token = session?.access_token ?? "";

  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthError("移动版尚未配置 Supabase。请从 GitHub Actions 构建并注入 Supabase Variables。");
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
    try {
      const data = await listMobileLogs(session!.user.id);
      setFiles(data.files);
      setFolders(data.folders);
      setProvider(data.provider);
      return data.files;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法读取日志");
      return [] as LogFile[];
    }
  }, [token, session]);

  useEffect(() => {
    if (!token) return;
    refreshTree();
  }, [token, refreshTree]);

  useEffect(() => {
    if (!token || files.length === 0) return;
    let cancelled = false;
    Promise.all(files.slice(0, 24).map(async (file) => {
      try {
        const document = await readMobileLog(file.path, session!.user.id);
        const parsed = parseLogDocument(document.content);
        return [file.path, { metadata: parsed.metadata, excerpt: excerpt(parsed.body) }] as const;
      } catch { return null; }
    })).then((items) => {
      if (!cancelled) setPreviews(Object.fromEntries(items.filter(Boolean) as Array<readonly [string, { metadata: LogMetadata; excerpt: string }] >));
    });
    return () => { cancelled = true; };
  }, [files, token, session]);

  const openLog = async (path: string) => {
    if (!token) return;
    try {
      const document = await readMobileLog(path, session!.user.id);
      const parsed = parseLogDocument(document.content);
      setSelectedPath(document.path);
      setOriginalPath(document.path);
      setActiveFolder(document.path.split("/").slice(0, -1).join("/"));
      setSha(document.sha);
      setMetadata(parsed.metadata);
      setBody(parsed.body);
      setSaveState("saved");
      setEditorMode("write");
      setScreen("editor");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法打开日志");
    }
  };

  const persist = async (publish = false) => {
    if (!metadata || !selectedPath || !token) return false;
    const nextMetadata = publish ? { ...metadata, draft: false } : metadata;
    const parsed = logMetadataSchema.safeParse(nextMetadata);
    if (!parsed.success) {
      setNotice(parsed.error.issues[0]?.message || "日志信息不完整");
      return false;
    }
    setSaveState("saving");
    try {
      const result = await saveMobileLog({
        path: selectedPath,
        content: serializeLogDocument(nextMetadata, body),
        sha,
        previousPath: originalPath && originalPath !== selectedPath ? originalPath : null,
        message: publish ? `logs: publish ${selectedPath} from iOS` : `logs: save ${selectedPath} from iOS`,
      }, session.user.id, publish || !nextMetadata.draft);
      setSha(result.sha);
      setOriginalPath(result.path);
      setMetadata(nextMetadata);
      setSaveState("saved");
      await refreshTree();
      setNotice(publish ? "已发布，网站刷新后即可看到" : "已保存到 Supabase");
      return true;
    } catch (error) {
      setSaveState("error");
      setNotice(error instanceof Error ? error.message : "保存失败");
      return false;
    }
  };

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
    setBody("");
    setSaveState("dirty");
    setNewDialog(false);
    setScreen("editor");
  };

  const createCategory = async (path: string) => {
    if (!token) return false;
    try {
      const result = await createMobileFolder(path, session!.user.id);
      await refreshTree();
      setActiveFolder(result);
      setFilter(result.split("/").pop() || "全部");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "分类创建失败");
      return false;
    }
  };

  const uploadImage = async (file: File) => {
    if (!session || !supabaseConfigured) return;
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      setUpload({ status: "error", name: file.name, message: "请选择不超过 12MB 的图片" });
      return;
    }
    const objectName = `${crypto.randomUUID()}-${safeUploadName(file.name) || "image.jpg"}`;
    const objectPath = `${session.user.id}/${new Date().toISOString().slice(0, 7)}/${objectName}`;
    setUpload({ status: "uploading", name: file.name });
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(storageBucket).upload(objectPath, file, { cacheControl: "31536000", upsert: false });
    if (error) {
      setUpload({ status: "error", name: file.name, message: error.message });
      return;
    }
    const { data } = supabase.storage.from(storageBucket).getPublicUrl(objectPath);
    setBody((current) => `${current}${current.endsWith("\n") || !current ? "" : "\n\n"}![${file.name.replace(/\.[^.]+$/, "")}](${data.publicUrl})\n`);
    setSaveState("dirty");
    setUpload({ status: "success", name: file.name, url: data.publicUrl });
  };

  const deleteCurrent = async () => {
    if (!originalPath || !token || !window.confirm("确定删除这篇日志吗？GitHub 历史中仍可恢复。")) return;
    try {
      await removeMobileLog(originalPath, session!.user.id);
      await refreshTree();
      setScreen("journal");
      setSelectedPath(null);
      setOriginalPath(null);
      setMetadata(null);
      setBody("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "删除失败");
    }
  };

  const categoryOptions = useMemo(() => categoryOptionsFromFolders(folders, metadata?.category), [folders, metadata?.category]);
  const folderFilters = useMemo(() => ["全部", ...folders.map((item) => item.split("/").pop() || item).filter((item, index, all) => all.indexOf(item) === index)], [folders]);
  const visibleFiles = useMemo(() => files.filter((file) => {
    const preview = previews[file.path];
    const matchesQuery = !query.trim() || `${file.path} ${preview?.metadata.title || ""} ${preview?.excerpt || ""}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "全部" || file.path.split("/").includes(filter);
    return matchesQuery && matchesFilter;
  }).sort((a, b) => (previews[b.path]?.metadata.date || "").localeCompare(previews[a.path]?.metadata.date || "")), [files, previews, query, filter]);

  if (!authReady) return <main className="mobile-loading"><span className="brand-orb" />正在打开蓝笺…</main>;
  if (!session) return <LoginScreen initialError={authError} />;

  return (
    <div className="mobile-app">
      {screen === "journal" && (
        <main className="journal-screen">
          <header className="mobile-hero">
            <div><span className="today-label">MY JOURNAL</span><h1>蓝笺</h1><p>{new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date())}</p></div>
            <button className="round-action" onClick={() => setScreen("settings")} aria-label="设置"><MoreHorizontal size={21} /></button>
          </header>
          <section className="journal-tools">
            <label className="mobile-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索你的记忆" /><SlidersHorizontal size={16} /></label>
            <div className="filter-strip">{folderFilters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
          </section>
          <section className="journal-list">
            <div className="list-heading"><div><h2>最近记录</h2><span>{visibleFiles.length} 篇日志</span></div><button onClick={() => setNewCategoryDialog(true)}><FolderPlus size={17} />分类</button></div>
            {visibleFiles.map((file) => {
              const preview = previews[file.path];
              const accent = preview?.metadata.accent || ["#2d7dff", "#1146a8"];
              return <button className="journal-card" key={file.path} onClick={() => openLog(file.path)}>
                <i className="accent-line" style={{ background: `linear-gradient(${accent[0]}, ${accent[1]})` }} />
                <span className="card-date">{compactDate(preview?.metadata.date || "")}</span>
                <strong>{preview?.metadata.title || file.name.replace(/\.(md|mdx)$/i, "")}</strong>
                <p>{preview?.excerpt || "打开继续书写这一页。"}</p>
                <span className="card-meta"><em>{file.path.split("/")[0]}</em>{preview?.metadata.draft ? "草稿" : "已发布"}</span>
              </button>;
            })}
            {!visibleFiles.length && <div className="mobile-empty"><BookOpen size={30} /><h2>这里还很安静</h2><p>写下今天第一段值得留下的话。</p></div>}
          </section>
          <button className="floating-compose" onClick={() => setNewDialog(true)}><Plus size={25} /><span>写日志</span></button>
        </main>
      )}

      {screen === "editor" && metadata && (
        <main className="mobile-editor">
          <header className="editor-nav">
            <button onClick={() => setScreen("journal")} aria-label="返回"><ArrowLeft size={23} /></button>
            <span className={`mobile-save-state is-${saveState}`}>{saveState === "saving" ? "正在同步…" : saveState === "dirty" ? "未保存" : saveState === "error" ? "同步失败" : "已同步"}</span>
            <button className="publish-pill" onClick={() => persist(true)} disabled={saveState === "saving"}><Send size={15} />发布</button>
          </header>
          <section className="editor-title-card" style={{ "--accent-a": metadata.accent[0], "--accent-b": metadata.accent[1] } as React.CSSProperties}>
            <span>{compactDate(metadata.date)} · {activeFolder || "日志"}</span>
            <textarea value={metadata.title} onChange={(event) => { setMetadata({ ...metadata, title: event.target.value }); setSaveState("dirty"); }} rows={2} aria-label="标题" />
          </section>
          <div className="editor-segment"><button className={editorMode === "write" ? "active" : ""} onClick={() => setEditorMode("write")}>书写</button><button className={editorMode === "preview" ? "active" : ""} onClick={() => setEditorMode("preview")}>预览</button></div>
          <section className="mobile-editor-body">
            {editorMode === "write" ? <textarea className="mobile-markdown-input" value={body} onChange={(event) => { setBody(event.target.value); setSaveState("dirty"); }} placeholder="此刻，你想记住什么？" autoCapitalize="sentences" />
              : <article className="mobile-markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{previewableMarkdown(body)}</ReactMarkdown></article>}
          </section>
          <input ref={imageInputRef} hidden type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadImage(file); event.currentTarget.value = ""; }} />
          <footer className="editor-dock">
            <button onClick={() => imageInputRef.current?.click()}><ImagePlus size={21} /><span>图片</span></button>
            <button onClick={() => setMetaOpen((value) => !value)}><SlidersHorizontal size={21} /><span>信息</span></button>
            <button onClick={() => persist(false)}><CloudUpload size={21} /><span>保存</span></button>
            <button className="danger" onClick={deleteCurrent} disabled={!originalPath}><Trash2 size={21} /><span>删除</span></button>
          </footer>
          {metaOpen && <section className="mobile-meta-sheet">
            <header><div><span>LOG DETAILS</span><h2>日志信息</h2></div><button onClick={() => setMetaOpen(false)}><X size={20} /></button></header>
            <label><span>日期</span><div><CalendarDays size={17} /><input type="date" value={metadata.date} onChange={(event) => { setMetadata({ ...metadata, date: event.target.value }); setSaveState("dirty"); }} /></div></label>
            <label><span>分类</span><div><BookOpen size={17} /><select value={metadata.category} onChange={(event) => { setMetadata({ ...metadata, category: event.target.value }); setSaveState("dirty"); }}>{categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={16} /></div></label>
            <label><span>标签</span><input value={metadata.tags.join(", ")} onChange={(event) => { setMetadata({ ...metadata, tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) }); setSaveState("dirty"); }} placeholder="生活, 旅行" /></label>
            <button className="accent-reroll" onClick={() => { setMetadata({ ...metadata, accent: randomAccent(metadata.accent) }); setSaveState("dirty"); }}><i style={{ background: `linear-gradient(135deg, ${metadata.accent[0]}, ${metadata.accent[1]})` }} /><span>随机一组日志点缀色</span><RefreshCw size={17} /></button>
          </section>}
        </main>
      )}

      {screen === "settings" && (
        <main className="settings-screen">
          <header className="settings-nav"><button onClick={() => setScreen("journal")}><ArrowLeft size={23} /></button><h1>设置</h1><span /></header>
          <section className="profile-card"><div className="profile-orb">蓝</div><div><strong>{session.user.email}</strong><span>Supabase 已连接</span></div><Check size={19} /></section>
          <section className="settings-group"><span>同步</span><div><CloudUpload size={20} /><p><strong>网站直传</strong><small>保存与发布会写入 Supabase，网站会即时读取已发布日志。</small></p><em>{provider || "supabase"}</em></div></section>
          <section className="settings-group"><span>存储</span><div><ImagePlus size={20} /><p><strong>Supabase Storage</strong><small>图片保存在 {storageBucket}，发布后可被网站直接引用。</small></p></div></section>
          <button className="signout-button" onClick={() => getSupabase().auth.signOut()}><LogOut size={19} />退出登录</button>
        </main>
      )}

      {upload.status !== "idle" && <div className={`mobile-toast is-${upload.status}`}>{upload.status === "uploading" ? <CloudUpload size={18} /> : upload.status === "success" ? <Check size={18} /> : <X size={18} />}<span>{upload.status === "uploading" ? "正在上传图片…" : upload.status === "success" ? "图片已插入日志" : upload.message}</span><button onClick={() => setUpload({ status: "idle" })}><X size={15} /></button></div>}
      {notice && <div className="mobile-toast"><Check size={18} /><span>{notice}</span><button onClick={() => setNotice("")}><X size={15} /></button></div>}
      {newDialog && <NewLogDialog folders={folders} categoryOptions={categoryOptions} initialFolder={activeFolder} onClose={() => setNewDialog(false)} onCreate={createLog} />}
      {newCategoryDialog && <NewCategoryDialog folders={folders} initialParent={activeFolder} onClose={() => setNewCategoryDialog(false)} onCreate={createCategory} />}
    </div>
  );
}
