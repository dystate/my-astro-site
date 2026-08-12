import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { RefreshCw, X } from "lucide-react";
import { randomAccent } from "../lib/accents";
import { categoryForFolder, type CategoryOption } from "../lib/categories";
import { defaultMetadata, slugifyFileName } from "../lib/frontmatter";
import type { LogMetadata } from "../lib/types";

interface Props {
  folders: string[];
  categoryOptions: CategoryOption[];
  initialFolder: string;
  onClose: () => void;
  onCreate: (path: string, metadata: LogMetadata) => void;
}

export default function NewLogDialog({ folders, categoryOptions, initialFolder, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileNameTouched, setFileNameTouched] = useState(false);
  const [folder, setFolder] = useState(initialFolder);
  const [category, setCategory] = useState(() => categoryForFolder(initialFolder));
  const [accent, setAccent] = useState<[string, string]>(() => randomAccent());
  const folderOptions = useMemo(() => Array.from(new Set([initialFolder, ...folders, "随笔"].filter(Boolean))), [folders, initialFolder]);

  useEffect(() => {
    if (!fileNameTouched) setFileName(slugifyFileName(title));
  }, [title, fileNameTouched]);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const base = slugifyFileName(fileName || title);
    const path = `${folder ? `${folder.replace(/^\/+|\/+$/g, "")}/` : ""}${base}.mdx`;
    onCreate(path, {
      ...defaultMetadata(title.trim() || "未命名日志"),
      category: category.trim() || "essay",
      motif: title.trim() || "LOG",
      accent,
    });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="new-log-title">
        <header>
          <div>
            <span className="eyebrow">NEW MARKDOWN</span>
            <h2 id="new-log-title">新建日志</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><X size={19} /></button>
        </header>
        <form onSubmit={submit}>
          <label className="field-label">
            <span>标题</span>
            <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="今天发生了什么？" required />
          </label>
          <div className="dialog-grid">
            <label className="field-label">
              <span>目录</span>
              <input list="log-folders" value={folder} onChange={(event) => {
                const nextFolder = event.target.value;
                setFolder(nextFolder);
                setCategory(categoryForFolder(nextFolder));
              }} placeholder="随笔" />
              <datalist id="log-folders">{folderOptions.map((item) => <option key={item} value={item} />)}</datalist>
            </label>
            <label className="field-label">
              <span>分类</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.value}</option>)}
              </select>
            </label>
          </div>
          <label className="field-label">
            <span>文件名</span>
            <div className="file-name-field">
              <input value={fileName} onChange={(event) => { setFileNameTouched(true); setFileName(event.target.value); }} required />
              <span>.mdx</span>
            </div>
          </label>
          <div className="accent-picker">
            <div>
              <span className="field-caption">随机配色</span>
              <strong>{accent[0]} · {accent[1]}</strong>
            </div>
            <div className="accent-preview" style={{ background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` }} />
            <button type="button" className="quiet-button" onClick={() => setAccent(randomAccent(accent))}>
              <RefreshCw size={15} /> 换一组
            </button>
          </div>
          <footer>
            <button type="button" className="quiet-button" onClick={onClose}>取消</button>
            <button className="primary-button">创建草稿</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
