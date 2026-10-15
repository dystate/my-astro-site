import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");
const COVER_COLORS = ["#0065FF", "#008F55", "#FF5A58", "#3E568C", "#00A3FF", "#FFC700"] as const;

export interface ShowEntry {
  slug: string;
  title: string;
  dateLabel: string;
  summary: string;
  tags: string[];
  readMins: number;
  cover?: string | null;
  accent?: [string, string] | null;
  motif?: string | null;
}
export interface ShowCategory { slug: string; title: string }

// 色卡上重复关键词的固定散布点（top%, left%, rotate, em）
const SPOTS = [
  [24, 5, -10, 1.8],
  [30, 64, 8, 1.4],
  [38, 28, -14, 1.7],
  [65, 62, 10, 1.6],
  [76, 6, 12, 1.5],
  [88, 38, -9, 1.6],
] as const;

// 年度封面的数字较宽，单独使用更稀疏的排布，并避开中央主标题。
const YEAR_SPOTS = [
  [24, 4, -9, 1.6],
  [30, 60, 8, 1.25],
  [38, 24, -12, 1.45],
  [65, 58, 9, 1.45],
  [76, 5, 11, 1.35],
  [88, 34, -8, 1.4],
] as const;

function Card({ e, n, color }: { e: ShowEntry; n: number; color: string }) {
  const motifSpots = e.motif === "2026" ? YEAR_SPOTS : SPOTS;
  return (
    <a className={`show-card ${e.cover ? "is-image" : "is-text"}`} href={`/logs/${e.slug}`}>
      <div
        className="card-media"
        style={
          e.cover
            ? { backgroundImage: `url(${e.cover})` }
            : { backgroundColor: color }
        }
      >
        {!e.cover && (
          <div className="card-motif" aria-hidden="true">
            {motifSpots.map(([t, l, r, s], i) => (
              <span key={i} style={{ top: `${t}%`, left: `${l}%`, transform: `rotate(${r}deg)`, fontSize: `${s}em` }}>
                {e.motif ?? e.title}
              </span>
            ))}
          </div>
        )}
      </div>
      {!e.cover && <div className="card-stamp">{e.motif ?? "LOG"}</div>}
      <div className="card-head">
        <div className="card-meta">{e.dateLabel}</div>
        <h3 className="card-title">{e.title}</h3>
      </div>
      <div className="card-index">{pad(n + 1)}</div>
    </a>
  );
}

function ListPanel({
  category, entries, onClose, reduce,
}: { category: ShowCategory; entries: ShowEntry[]; onClose: () => void; reduce: boolean }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const [serif, sans] = category.title.split("*");

  return (
    <motion.div
      className="list-panel"
      initial={reduce ? { opacity: 0 } : { x: "100%" }}
      animate={reduce ? { opacity: 1 } : { x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "100%" }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="list-top">
        <div className="list-cat">
          <span className="t-serif">{serif}</span>
          {sans && <span className="t-sans"> {sans}</span>}
          <span className="list-count">／ {pad(entries.length)} 篇</span>
        </div>
        <button className="list-close" onClick={onClose} aria-label="收起列表">CLOSE ✕</button>
      </div>

      <div className="list-rows">
        {entries.map((e, i) => (
          <motion.a
            key={e.slug}
            href={`/logs/${e.slug}`}
            className="list-row"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: EASE }}
          >
            <span className="lr-num">{pad(i + 1)}</span>
            <span className="lr-main">
              <span className="lr-title">{e.title}</span>
              {e.tags.length > 0 && <span className="lr-tags">{e.tags.map((t) => `#${t}`).join("  ")}</span>}
            </span>
            <span className="lr-date">{e.dateLabel}</span>
            <span className="lr-arrow">→</span>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

export default function LogsShowcase({
  category, entries, index = 0,
}: { category: ShowCategory; entries: ShowEntry[]; index?: number }) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const top3 = entries.slice(0, 3);
  const [serif, sans] = category.title.split("*");

  return (
    <section className="showcase">
      {/* 左侧：分类 + 介绍（移动端自动移到顶部） */}
      <div className="show-intro">
        <h2 className="intro-title">
          <span className="t-serif">{serif}</span>
          {sans && <span className="t-sans">{sans}</span>}
        </h2>
        <button className="intro-more" onClick={() => setOpen(true)}>展开更多 ／ VIEW ALL →</button>
      </div>

      {/* 右侧：三张竖卡横排（时间序） */}
      <div className="show-track">
        {top3.map((e, i) => (
          <Card key={e.slug} e={e} n={i} color={COVER_COLORS[(index + i) % COVER_COLORS.length]} />
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <ListPanel category={category} entries={entries} onClose={() => setOpen(false)} reduce={reduce} />
        )}
      </AnimatePresence>
    </section>
  );
}
