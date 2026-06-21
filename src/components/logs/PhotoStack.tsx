import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * PhotoStack —— 滚动叠卡照片集合，带「收起 / 展开」开关。
 * 展开（默认）：随滚动堆叠的 sticky 效果。
 * 收起：停掉滚动效果，变成一个静止的 cards stack（错位露边的小卡堆），只占一张卡的高度。
 *
 *   <PhotoStack items={trek} client:visible />
 *   <PhotoStack items={trek} defaultCollapsed client:visible />  // 默认收起
 */
export interface PhotoItem {
  src: string;
  title?: string;
  caption?: string;
  tint?: string;
}

/* 卡面内容（媒体 + 叠色 + 渐变 + 文字 + 编号），展开/收起共用 */
function CardFace({ item, i, total, media }: { item: PhotoItem; i: number; total: number; media: React.ReactNode }) {
  return (
    <>
      {media}
      {item.tint && <div className="ps-tint" style={{ background: item.tint }} />}
      <div className="ps-overlay" />
      <div className="ps-info">
        {item.title && <div className="ps-title">{item.title}</div>}
        {item.caption && <div className="ps-cap">{item.caption}</div>}
      </div>
      <span className="ps-index">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
    </>
  );
}

/* 展开模式：随滚动堆叠 */
function StackCard({
  item, i, total, progress, reduce,
}: { item: PhotoItem; i: number; total: number; progress: MotionValue<number>; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const targetScale = 1 - (total - 1 - i) * 0.045;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const top = `${i * 26}px`;

  return (
    <div className="ps-sticky" ref={ref}>
      <motion.div className="ps-card" style={reduce ? { top } : { top, scale }}>
        <CardFace
          item={item} i={i} total={total}
          media={
            <motion.div
              className="ps-media"
              style={reduce ? { backgroundImage: `url(${item.src})` } : { backgroundImage: `url(${item.src})`, scale: imageScale }}
            />
          }
        />
      </motion.div>
    </div>
  );
}

/* 收起模式：静止的 cards stack（错位露边） */
function DeckCard({ item, i, total }: { item: PhotoItem; i: number; total: number }) {
  return (
    <div
      className="ps-deck-card"
      style={{ zIndex: total - i, transform: `translateY(${i * 14}px) scale(${1 - i * 0.04})` }}
    >
      <CardFace
        item={item} i={i} total={total}
        media={<div className="ps-media" style={{ backgroundImage: `url(${item.src})` }} />}
      />
    </div>
  );
}

export default function PhotoStack({
  items, bleed = false, defaultCollapsed = false,
}: { items: PhotoItem[]; bleed?: boolean; defaultCollapsed?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!items?.length) return null;

  return (
    <div className={`ps-stack${bleed ? " ps-bleed" : ""}${collapsed ? " is-collapsed" : ""}`} ref={ref}>
      <style>{CSS}</style>

      <div className="ps-toolbar">
        <button
          className="ps-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-pressed={collapsed}
          aria-label={collapsed ? "展开照片" : "收起照片"}
        >
          {collapsed ? "展开 ↓" : "收起 ↑"}
        </button>
      </div>

      {collapsed ? (
        <div className="ps-deck">
          {items.map((item, i) => (
            <DeckCard key={i} item={item} i={i} total={items.length} />
          ))}
        </div>
      ) : (
        items.map((item, i) => (
          <StackCard key={i} item={item} i={i} total={items.length} progress={scrollYProgress} reduce={reduce} />
        ))
      )}
    </div>
  );
}

const CSS = `
.ps-stack { position: relative; margin: 0.25rem 0; }
.ps-bleed { width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); }

/* 开关条（右上角，sticky，滚动时也够得着） */
.ps-toolbar {
  position: -webkit-sticky; position: sticky; top: clamp(64px,9vh,84px); z-index: 6;
  display: flex; justify-content: flex-end; padding-bottom: 8px; pointer-events: none;
}
.ps-stack.is-collapsed .ps-toolbar { position: static; margin-bottom: 8px; }
.ps-toggle {
  pointer-events: auto; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  color: #fff; font: 800 12px/1 "Open Sans", sans-serif; letter-spacing: .06em;
  padding: 8px 14px; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  transition: background .2s, border-color .2s;
}
.ps-toggle:hover { background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.26); }

/* 展开：滚动槽 */
.ps-sticky {
  height: min(72vh, 500px); display: flex; align-items: flex-start; justify-content: center;
  position: -webkit-sticky; position: sticky; top: 0; padding: clamp(24px,6vh,56px) 16px 0; box-sizing: border-box;
}
.ps-card {
  position: relative; width: min(100%, 440px); height: min(50vh, 340px);
  border-radius: 14px; overflow: hidden; will-change: transform; transform-origin: top center;
  box-shadow: 0 22px 46px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06);
}

/* 收起：静止卡堆 */
.ps-deck { position: relative; width: min(100%, 440px); height: min(54vh, 372px); margin: 0 auto; }
.ps-deck-card {
  position: absolute; left: 0; top: 0; width: 100%; height: min(50vh, 340px);
  border-radius: 14px; overflow: hidden; transform-origin: top center;
  box-shadow: 0 22px 46px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06);
}

/* 卡面内部（共用） */
.ps-media { position: absolute; inset: 0; background-size: cover; background-position: center; will-change: transform; }
.ps-tint { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: .5; pointer-events: none; }
.ps-overlay { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.15) 38%, rgba(0,0,0,0) 60%); }
.ps-info { position: absolute; left: 0; right: 0; bottom: 0; padding: clamp(14px,2.2vw,22px); z-index: 2; }
.ps-info .ps-title {
  margin: 0; font-family: "Instrument Serif", Georgia, serif; font-weight: 400;
  font-size: clamp(22px,3vw,34px); line-height: 1.06; letter-spacing: -.01em; color: #fff;
  text-shadow: 0 2px 16px rgba(0,0,0,.45);
}
.ps-info .ps-cap {
  margin: 7px 0 0; font-family: "Geist Variable", "Geist", system-ui, sans-serif;
  font-size: clamp(13px,1.4vw,15px); line-height: 1.45; color: rgba(255,255,255,.84); max-width: 46ch;
}
.ps-index {
  position: absolute; top: clamp(16px,2.4vw,26px); right: clamp(16px,2.4vw,26px); z-index: 2;
  font: 700 12px/1 "Nokia Cellphone FC Small", ui-monospace, "SFMono-Regular", monospace;
  letter-spacing: .08em; color: rgba(255,255,255,.85);
}

@media (max-width: 640px) {
  .ps-card { width: 86vw; height: min(56vh, 320px); border-radius: 12px; }
  .ps-deck { width: 86vw; height: min(58vh, 350px); }
  .ps-deck-card { width: 86vw; height: min(56vh, 320px); border-radius: 12px; }
}
`;
