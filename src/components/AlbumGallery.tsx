import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AlbumItem } from "../data/album";

const EASE = [0.16, 1, 0.3, 1] as const;

const NAV = [
  { label: "ALBUM", href: "/album" },
  { label: "LOGS", href: "/logs" },
  { label: "MYDAN", href: "/woaidan" },
];
const SOCIALS = [
  { label: "TIKTOK", href: "https://douyin.com" },
  { label: "VIMEO", href: "https://vimeo.com" },
];

/* ── 像素加号（与站点菜单一致） ── */
function PixelCross({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  const cells: [number, number][] = [
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    [0, 2], [1, 2], [3, 2], [4, 2],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {cells.map(([c, r], i) => (
        <rect key={i} x={c * 5} y={r * 5} width={4} height={4} fill={color} />
      ))}
    </svg>
  );
}

/* ── 点阵/半调装饰（切换钮右侧） ── */
function Halftone() {
  const cols = 9, rows = 4, s = 3, g = 1;
  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) if ((r + c) % 2 === 0) cells.push([c, r]);
  return (
    <svg width={cols * (s + g)} height={rows * (s + g)} aria-hidden>
      {cells.map(([c, r], i) => (
        <rect key={i} x={c * (s + g)} y={r * (s + g)} width={s} height={s} fill="currentColor" />
      ))}
    </svg>
  );
}

/* ── 四角选择手柄（贴合虚线选框） ── */
function Handles() {
  const base = "absolute w-[7px] h-[7px] bg-white";
  return (
    <>
      <span className={`${base} -top-[3px] -left-[3px]`} />
      <span className={`${base} -top-[3px] -right-[3px]`} />
      <span className={`${base} -bottom-[3px] -left-[3px]`} />
      <span className={`${base} -bottom-[3px] -right-[3px]`} />
    </>
  );
}

/* ── 单个媒体块：视频进入视口自动播放、离开暂停 ── */
function MediaTile({ item }: { item: AlbumItem }) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const [a, b] = item.accent ?? ["#2a2a2a", "#0a0a0a"];

  return (
    <div className="relative w-full overflow-hidden bg-black aspect-[4/3] sm:aspect-[2/1]">
      {item.media?.type === "video" ? (
        <video
          ref={vref}
          src={item.media.src}
          poster={item.media.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : item.media?.type === "image" ? (
        <img
          src={item.media.src}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ background: `radial-gradient(120% 120% at 50% 30%, ${a}, ${b})` }}
        >
          <span className="font-nokia text-white/35 text-[11px] tracking-[0.32em]">
            ▶ {item.title}
          </span>
        </div>
      )}

      {/* 扫描线 + 暗角，呼应站点的 CRT 质感 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom,rgba(0,0,0,.10) 0 1px,transparent 1px 3px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 40%, transparent 58%, rgba(0,0,0,.5))" }}
      />
    </div>
  );
}

export default function AlbumGallery({ items }: { items: AlbumItem[] }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<"gallery" | "list">("gallery");
  const [open, setOpen] = useState(false);

  // 菜单打开锁滚动
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main
      className="relative min-h-dvh bg-black text-white"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      {/* ── 顶部 ── */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-4"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.92), rgba(0,0,0,0))" }}
        >
          <a
            href="/"
            className="leading-none tracking-tight text-white"
            style={{ fontWeight: 800, fontSize: "clamp(24px,6vw,40px)" }}
          >
            Dystate
          </a>

          {/* 桌面导航 */}
          <nav className="hidden sm:flex items-center gap-8" style={{ fontWeight: 800 }}>
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-[18px] tracking-[0.04em] hover:opacity-60 transition-opacity"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* 移动端 MENU */}
          <button
            onClick={() => setOpen(true)}
            className="sm:hidden flex items-center gap-2 text-white"
            style={{ fontWeight: 800 }}
            aria-label="打开菜单"
          >
            <span className="text-[22px] tracking-[0.04em] leading-none">MENU</span>
            <PixelCross size={20} />
          </button>
        </div>
      </header>

      {/* ── 内容 ── */}
      <section className="mx-auto w-full max-w-[1180px] px-3 sm:px-4 pt-[76px] sm:pt-[96px] pb-28">
        <AnimatePresence mode="wait">
          {view === "gallery" ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              {items.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.href ?? "#"}
                  className="group block"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <MediaTile item={item} />
                  <div className="flex items-end justify-between gap-4 px-1 pt-3 pb-8 sm:pb-12">
                    <h2
                      className="leading-none tracking-tight"
                      style={{ fontWeight: 800, fontSize: "clamp(30px,8vw,52px)" }}
                    >
                      {item.title}
                    </h2>
                    <div className="text-right leading-tight shrink-0">
                      <div className="text-white/70 text-[13px] sm:text-[14px] tracking-wide">
                        {item.year}
                      </div>
                      <div
                        className="text-white text-[14px] sm:text-[15px] tracking-wide"
                        style={{ fontWeight: 800 }}
                      >
                        {item.client}
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/12"
            >
              <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_12rem] gap-4 px-1 py-3 text-white/40 text-[12px] tracking-[0.18em] border-b border-white/12">
                <span>#</span>
                <span>TITLE</span>
                <span>YEAR</span>
                <span className="text-right">CLIENT</span>
              </div>
              {items.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.href ?? "#"}
                  className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[3rem_1fr_6rem_12rem] items-center gap-3 sm:gap-4 px-1 py-4 sm:py-5 border-b border-white/10 hover:bg-white/[0.04] transition-colors"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5% 0px" }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.2), ease: EASE }}
                >
                  <span className="text-white/40 tabular-nums text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate" style={{ fontWeight: 800, fontSize: "clamp(18px,4.5vw,26px)" }}>
                    {item.title}
                  </span>
                  <span className="hidden sm:block text-white/60 text-sm">{item.year}</span>
                  <span className="text-right text-white/85 text-sm sm:text-[15px]" style={{ fontWeight: 700 }}>
                    <span className="sm:hidden text-white/45">{item.year} · </span>
                    {item.client}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── 浮动视图切换 ── */}
      <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => setView((v) => (v === "gallery" ? "list" : "gallery"))}
          className="pointer-events-auto relative flex items-center gap-3 px-5 py-3 text-white bg-black/70 backdrop-blur-sm active:scale-[0.97] transition-transform"
          style={{ outline: "1px dashed rgba(255,255,255,.55)", outlineOffset: "3px" }}
          aria-label="切换视图"
        >
          <Handles />
          <span
            className="text-[13px] leading-[1.05] tracking-[0.06em] text-left"
            style={{ fontWeight: 800 }}
          >
            {view === "gallery" ? (
              <>
                LIST
                <br />
                VIEW
              </>
            ) : (
              <>
                GRID
                <br />
                VIEW
              </>
            )}
          </span>
          <span className="text-white/90">
            <Halftone />
          </span>
        </button>
      </div>

      {/* ── 移动端全屏菜单 ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[70] flex flex-col bg-black text-white"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <span
                className="leading-none tracking-tight"
                style={{ fontWeight: 800, fontSize: "clamp(24px,6vw,40px)" }}
              >
                Dystate
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
                style={{ fontWeight: 800 }}
                aria-label="关闭菜单"
              >
                <span className="text-[22px] tracking-[0.04em] leading-none">CLOSE</span>
                <motion.span animate={{ rotate: 45 }} className="inline-flex">
                  <PixelCross size={20} />
                </motion.span>
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-end justify-center px-4">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE }}
                  className="text-[64px] leading-[0.95] tracking-[-0.02em]"
                  style={{ fontWeight: 800 }}
                >
                  {n.label}
                </motion.a>
              ))}
            </nav>

            <div className="flex flex-col items-end gap-1 p-4 pb-8">
              {SOCIALS.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                  className="text-[16px] tracking-[0.04em]"
                  style={{ fontWeight: 800 }}
                >
                  {s.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
