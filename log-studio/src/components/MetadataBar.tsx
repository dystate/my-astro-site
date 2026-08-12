import { RefreshCw } from "lucide-react";
import { randomAccent } from "../lib/accents";
import type { CategoryOption } from "../lib/categories";
import type { LogMetadata } from "../lib/types";

interface Props {
  metadata: LogMetadata;
  categoryOptions: CategoryOption[];
  onChange: (next: LogMetadata) => void;
}

export default function MetadataBar({ metadata, categoryOptions, onChange }: Props) {
  const update = <K extends keyof LogMetadata>(key: K, value: LogMetadata[K]) => onChange({ ...metadata, [key]: value });
  return (
    <section className="metadata-bar" aria-label="日志元数据">
      <label className="meta-field meta-title">
        <span>标题</span>
        <input value={metadata.title} onChange={(event) => update("title", event.target.value)} />
      </label>
      <label className="meta-field">
        <span>日期</span>
        <input type="date" value={metadata.date} onChange={(event) => update("date", event.target.value)} />
      </label>
      <label className="meta-field">
        <span>分类</span>
        <select value={metadata.category} onChange={(event) => update("category", event.target.value)}>
          {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.value}</option>)}
        </select>
      </label>
      <label className="meta-field meta-tags">
        <span>标签</span>
        <input value={metadata.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))} placeholder="随笔, 日常" />
      </label>
      <div className="meta-field accent-field">
        <span>配色</span>
        <button type="button" title="随机换一组配色" onClick={() => update("accent", randomAccent(metadata.accent))}>
          <i style={{ background: `linear-gradient(135deg, ${metadata.accent[0]}, ${metadata.accent[1]})` }} />
          <RefreshCw size={13} />
        </button>
      </div>
      <label className="draft-field">
        <span>草稿</span>
        <input type="checkbox" checked={metadata.draft} onChange={(event) => update("draft", event.target.checked)} />
        <i aria-hidden="true" />
      </label>
    </section>
  );
}
