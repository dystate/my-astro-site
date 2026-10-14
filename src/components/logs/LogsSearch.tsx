import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface SearchEntry {
  slug: string;
  title: string;
  dateLabel: string;
  summary: string;
  tags: string[];
  catTitle: string;
}

const MAX = 8;

export default function LogsSearch({ entries }: { entries: SearchEntry[] }) {
  const reduce = useReducedMotion() ?? false;
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number | undefined>(undefined);

  const revealSearch = () => {
    window.clearTimeout(blurTimer.current);
    setExpanded(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return entries
      .filter((e) => {
        const hay = `${e.title} ${e.summary} ${e.catTitle} ${e.tags.join(" ")}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, MAX);
  }, [query, entries]);

  const open = focused && query.length > 0;
  const compact = isMobile && !expanded;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px), (hover: none) and (pointer: coarse)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // "/" 聚焦搜索框，Esc 清空并失焦
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = inputRef.current;
      if (e.key === "/" && document.activeElement !== el) {
        e.preventDefault();
        revealSearch();
      } else if (e.key === "Escape" && document.activeElement === el) {
        setQ("");
        setExpanded(false);
        el?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={`logs-search ${expanded ? "is-expanded" : ""}`}
      style={isMobile ? {
        left: 14,
        bottom: 14,
        width: expanded ? "min(calc(100vw - 28px), 320px)" : 42,
        transform: "none",
      } : undefined}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            className="ls-results"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {results.length === 0 ? (
              <div className="ls-empty">没有找到「{q.trim()}」相关的日志</div>
            ) : (
              results.map((e) => (
                <a key={e.slug} className="ls-row" href={`/logs/${e.slug}`}>
                  <span className="ls-cat">{e.catTitle}</span>
                  <span className="ls-title">{e.title}</span>
                  <span className="ls-date">{e.dateLabel}</span>
                </a>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ls-bar">
        {/* 边框：静止时白色虚线，聚焦时沿周长一段段描成白色实线 */}
        <svg className="ls-border" aria-hidden="true">
          <rect className="ls-b-dash" x="0" y="0" width="100%" height="100%" pathLength={100} />
          <rect className="ls-b-solid" x="0" y="0" width="100%" height="100%" pathLength={100} />
        </svg>
        <button
          className="ls-trigger"
          type="button"
          aria-label="打开日志搜索"
          aria-expanded={!compact}
          onClick={revealSearch}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="10" height="10" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="6" height="6" fill="currentColor" />
          </svg>
        </button>
        {!compact && (
          <>
            <input
              ref={inputRef}
              className="ls-input"
              type="search"
              value={q}
              placeholder="搜索日志 ／ SEARCH"
              aria-label="搜索日志"
              autoComplete="off"
              spellCheck={false}
              onChange={(ev) => setQ(ev.target.value)}
              onFocus={() => {
                window.clearTimeout(blurTimer.current);
                setExpanded(true);
                setFocused(true);
              }}
              onBlur={() => {
                // 延迟失焦，保证点击结果链接能先完成跳转
                blurTimer.current = window.setTimeout(() => {
                  setFocused(false);
                  if (!q.trim()) setExpanded(false);
                }, 150);
              }}
            />
            {q ? (
              <button className="ls-clear" aria-label="清空" onClick={() => { setQ(""); inputRef.current?.focus(); }}>
                ✕
              </button>
            ) : (
              <kbd className="ls-kbd">/</kbd>
            )}
          </>
        )}
      </div>
    </div>
  );
}
