import { useMemo, useState, type SyntheticEvent } from "react";
import { FolderPlus, X } from "lucide-react";

interface Props {
  folders: string[];
  initialParent: string;
  onClose: () => void;
  onCreate: (path: string) => Promise<boolean>;
}

export default function NewCategoryDialog({ folders, initialParent, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState(initialParent);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const parents = useMemo(() => ["", ...Array.from(new Set(folders))], [folders]);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || /[\\/<>:"|?*]/.test(clean)) {
      setError("分类名称不能包含路径符号或特殊字符");
      return;
    }
    const path = parent ? `${parent}/${clean}` : clean;
    if (folders.includes(path)) {
      setError("这个分类已经存在");
      return;
    }
    setSaving(true);
    setError("");
    const created = await onCreate(path);
    setSaving(false);
    if (created) onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog-card category-dialog" role="dialog" aria-modal="true" aria-labelledby="new-category-title">
        <header>
          <div>
            <span className="eyebrow">NEW CATEGORY</span>
            <h2 id="new-category-title">新建分类</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><X size={19} /></button>
        </header>
        <form onSubmit={submit}>
          <label className="field-label">
            <span>分类名称</span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：旅行" required />
          </label>
          <label className="field-label">
            <span>上级分类</span>
            <select value={parent} onChange={(event) => setParent(event.target.value)}>
              <option value="">根目录</option>
              {parents.filter(Boolean).map((folder) => <option key={folder} value={folder}>{folder}</option>)}
            </select>
          </label>
          <div className="category-path-preview"><FolderPlus size={17} /><span>{parent ? `${parent} / ` : ""}{name.trim() || "新分类"}</span></div>
          {error && <p className="dialog-error">{error}</p>}
          <footer>
            <button type="button" className="quiet-button" onClick={onClose}>取消</button>
            <button className="primary-button" disabled={saving}>{saving ? "创建中…" : "创建分类"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
