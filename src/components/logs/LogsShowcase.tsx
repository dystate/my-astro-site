import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

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
export interface ShowCategory { slug: string; title: string; blurb: string }

// 色卡上重复关键词的固定散布点（top%, left%, rotate, em）
const SPOTS = [
  [6, 4, -12, 2.4], [18, 60, 8, 1.8], [30, 22, -22, 3.2], [44, 70, 18, 2.0],
  [54, 6, 10, 2.6], [66, 46, -8, 3.0], [78, 18, 22, 2.2], [85, 64, -16, 2.8],
  [14, 36, 30, 1.6], [40, 44, -30, 2.0], [73, 80, 6, 1.8], [92, 34, -10, 2.4],
] as const;

function Card({ e, n }: { e: ShowEntry; n: number }) {
  const accent = e.accent ?? ["#5451f2", "#312fb0"];
  return (
    <a className={`show-card ${e.cover ? "is-image" : "is-text"}`} href={`/logs/${e.slug}`}>
      <div
        className="card-media"
        style={
          e.cover
            ? { backgroundImage: `url(${e.cover})` }
            : { background: `linear-gradient(160deg, ${accent[0]}, ${accent[1]})` }
        }
      >
        {!e.cover && (
          <div className="card-motif" aria-hidden="true">
            {SPOTS.map(([t, l, r, s], i) => (
              <span key={i} style={{ top: `${t}%`, left: `${l}%`, transform: `rotate(${r}deg)`, fontSize: `${s}em` }}>
                {e.motif ?? e.title}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="card-grad" />
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
  category, entries,
}: { category: ShowCategory; entries: ShowEntry[]; index?: number }) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const top3 = entries.slice(0, 3);
  const [serif, sans] = category.title.split("*");

  return (
    <section className="showcase">
      {/* 左侧：分类 + 介绍（移动端自动移到顶部） */}
      <div className="show-intro">
        <div className="intro-kicker">LOGS · {pad(entries.length)} ENTRIES</div>
        <h2 className="intro-title">
          <span className="t-serif">{serif}</span>
          {sans && <span className="t-sans">{sans}</span>}
        </h2>
        <p className="intro-blurb">{category.blurb}</p>
        <button className="intro-more" onClick={() => setOpen(true)}>展开更多 ／ VIEW ALL →</button>
      </div>

      {/* 右侧：三张竖卡横排（时间序） */}
      <div className="show-track">
        {top3.map((e, i) => (
          <Card key={e.slug} e={e} n={i} />
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
