import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { DeskObject, DeskBook, DeskAction } from "../../data/album";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  albumTitle: string;
  objects: DeskObject[];
};

/** 由厚度生成「一层层书页」的侧边挤出（交替奶白色 = 页边纹理） */
function bookExtrusion(thickness: number): string {
  const layers: string[] = [];
  for (let i = 1; i <= thickness; i++) {
    const c = i % 2 ? "#f4ecda" : "#e3dabf"; // 相邻页交替明暗，模拟纸张层叠
    layers.push(`${i}px ${i}px 0 ${c}`);
  }
  // 厚度块底部稍压暗 + 落在桌面上的接触阴影
  layers.push(`${thickness}px ${thickness}px 0 #c8bd9b`);
  layers.push(`${thickness + 2}px ${thickness + 8}px 22px rgba(0,0,0,.55)`);
  return layers.join(", ");
}

/* ─────────────── 单本立体书 ─────────────── */
function Book({
  book,
  reduce,
  onOpen,
}: {
  book: DeskBook;
  reduce: boolean;
  onOpen: (o: DeskObject) => void;
}) {
  const thickness = book.thickness ?? 28;
  const w = book.w ?? 210;
  const rot = book.rotate ?? 0;

  return (
    <motion.button
      type="button"
      className="desk-obj"
      style={{ left: `${book.x}%`, top: `${book.y}%` }}
      onClick={() => onOpen(book)}
      aria-label={`打开《${book.title}》`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* 落在桌面的柔和投影（全局光，不随书旋转） */}
      <span className="obj-shadow" style={{ width: `min(${w}px, 60vw)`, height: `min(${w * 1.32}px, 80vw)` }} />

      {/* 书本体（旋转 = 歪斜摆放） */}
      <span className="book" style={{ "--rot": `${rot}deg` } as React.CSSProperties}>
        <span className="book__plate" style={{ width: `min(${w}px, 60vw)` }}>
          <img
            className="book__cover"
            src={book.cover}
            alt={book.title}
            draggable={false}
            style={{ boxShadow: bookExtrusion(thickness) }}
          />
          {/* 左侧装订书脊 */}
          <span className="book__spine" style={{ width: `${Math.max(10, thickness * 0.55)}px` }} />
          {/* 顶部高光 */}
          <span className="book__sheen" />
        </span>
      </span>
    </motion.button>
  );
}

/* ─────────────── 点击后的内容浮层（timeline / toc / 待定） ─────────────── */
function ActionPanel({ obj, onClose }: { obj: DeskObject; onClose: () => void }) {
  const action: DeskAction = obj.action ?? { kind: "none" };
  const label =
    action.kind === "timeline" ? "时间轴" : action.kind === "toc" ? "目录" : "内容待定";

  return (
    <motion.div
      className="desk-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="desk-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="desk-panel__top">
          <div>
            <div className="desk-panel__kicker">{label}</div>
            <h2 className="desk-panel__title">{obj.title}</h2>
          </div>
          <button className="desk-panel__close" onClick={onClose} aria-label="关闭">
            CLOSE ✕
          </button>
        </div>

        {/* 占位：等你确定是时间轴还是目录，再填这里的内容 */}
        <div className="desk-panel__body">
          <p>这里之后会展示「{obj.title}」的{label}。</p>
          <p className="desk-panel__hint">（点击物品 → 弹出内容的交互已接好，内容形式待定）</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DeskBoard({ albumTitle, objects }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState<DeskObject | null>(null);

  return (
    <main className="desk-root">
      {/* 顶部：返回 + 作品名（与画廊页一致） */}
      <header className="desk-header">
        <a href="/album" className="desk-back">← ALBUM</a>
        <span className="desk-name">{albumTitle}</span>
      </header>

      {/* 桌面 */}
      <div className="desk-surface">
        {objects.map((o) =>
          o.type === "book" ? (
            <Book key={o.id} book={o} reduce={reduce} onOpen={setActive} />
          ) : null
        )}
      </div>

      {objects.length === 0 && (
        <p className="desk-empty">桌面还空着——之后往这里摆放物品。</p>
      )}

      <AnimatePresence>
        {active && <ActionPanel obj={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      <style>{css}</style>
    </main>
  );
}

const css = `
.desk-root {
  position: relative; min-height: 100dvh; width: 100%; overflow: hidden;
  background:
    radial-gradient(120% 90% at 50% 8%, #20201d 0%, #121211 42%, #090908 100%);
  color: #fff; font-family: 'Open Sans', sans-serif;
}
/* 桌面细颗粒质感 */
.desk-root::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .5;
  background-image: radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 4px 4px;
}

.desk-header {
  position: absolute; top: 0; inset-inline: 0; z-index: 40;
  display: flex; align-items: center; justify-content: space-between;
  padding: clamp(16px,3vw,24px) clamp(16px,5vw,32px);
}
.desk-back, .desk-name {
  font-weight: 800; font-size: 14px; letter-spacing: .12em; color: rgba(255,255,255,.72);
  text-decoration: none; transition: color .2s;
}
.desk-back:hover { color: #fff; }

.desk-surface { position: absolute; inset: 0; }

/* 物品定位容器（不旋转，只负责放到 x/y） */
.desk-obj {
  position: absolute; transform: translate(-50%, -50%);
  background: none; border: none; padding: 0; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* 桌面投影：固定全局光方向，悬停时变大 */
.obj-shadow {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-44%, -38%) scale(var(--sh, 1));
  border-radius: 14px; background: rgba(0,0,0,.5); filter: blur(26px);
  transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .35s;
  opacity: .55; z-index: 0;
}

/* 书：旋转 + 悬停抬起 */
.book {
  position: relative; display: block; z-index: 1;
  transform: rotate(var(--rot)) translateY(var(--lift, 0px)) scale(var(--sc, 1));
  transition: transform .35s cubic-bezier(.16,1,.3,1);
}
.desk-obj:hover .book { --lift: -12px; --sc: 1.035; }
.desk-obj:hover .obj-shadow { --sh: 1.12; opacity: .62; }
.desk-obj:active .book { --lift: -6px; --sc: 1.01; }

.book__plate { position: relative; display: block; }
.book__cover {
  display: block; width: 100%; height: auto; border-radius: 3px;
  -webkit-user-select: none; user-select: none;
}
/* 左侧装订线 */
.book__spine {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px 0 0 3px;
  background: linear-gradient(90deg, rgba(0,0,0,.30), rgba(0,0,0,.06) 60%, rgba(0,0,0,0));
}
.book__spine::after {
  content: ""; position: absolute; left: 2px; top: 0; bottom: 0; width: 1px;
  background: rgba(255,255,255,.12);
}
/* 顶部光泽 */
.book__sheen {
  position: absolute; inset: 0; border-radius: 3px; pointer-events: none;
  background: radial-gradient(130% 80% at 22% 10%, rgba(255,255,255,.18), transparent 52%);
}

.desk-empty {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: rgba(255,255,255,.4); font-style: italic; font-family: 'Instrument Serif', serif; font-size: 20px;
}

/* ── 点击浮层 ── */
.desk-overlay {
  position: fixed; inset: 0; z-index: 80; display: grid; place-items: center;
  padding: 24px; background: rgba(0,0,0,.55); backdrop-filter: blur(6px);
}
.desk-panel {
  width: min(92vw, 560px); max-height: 80vh; overflow-y: auto;
  background: #0e0e0d; border: 1px solid rgba(255,255,255,.14);
  box-shadow: 0 24px 70px rgba(0,0,0,.6);
}
.desk-panel__top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: clamp(20px,3vw,28px); border-bottom: 1px solid rgba(255,255,255,.1);
}
.desk-panel__kicker {
  font: 700 11px/1 "Nokia Cellphone FC Small", ui-monospace, monospace;
  letter-spacing: .14em; color: #5451f2; text-transform: uppercase; margin-bottom: 10px;
}
.desk-panel__title { margin: 0; font-family: 'Instrument Serif', serif; font-weight: 400; font-size: clamp(28px,5vw,40px); line-height: 1.05; }
.desk-panel__close { background: none; border: none; cursor: pointer; color: #fff; font: 800 12px/1 "Open Sans",sans-serif; letter-spacing: .08em; transition: opacity .2s; }
.desk-panel__close:hover { opacity: .6; }
.desk-panel__body { padding: clamp(20px,3vw,28px); color: rgba(255,255,255,.8); font-size: 15px; line-height: 1.6; }
.desk-panel__hint { margin-top: 12px; color: rgba(255,255,255,.45); font-size: 13px; }

@media (prefers-reduced-motion: reduce) {
  .book, .obj-shadow { transition: none; }
}
`;
