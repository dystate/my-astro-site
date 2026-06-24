import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { AlbumPhoto } from "../../data/album";

/* ── 隧道参数 ── */
const GROWTH = 1.7;       // 远处缩小的倍率（每远一层 ×1/GROWTH）；缩放上限锁定为 1，不会超过基准尺寸
const PASS = 1.25;        // 穿过镜头后再走多远才完全消失（负深度方向）
const FRONT = 0.25;       // 到达该深度后开始淡出
const WHEEL_SENS = 0.0024; // 滚轮 → 前进量灵敏度
const TOUCH_SENS = 0.006;  // 触摸滑动灵敏度
const AUTO_SPEED = 0.0055; // 自动前进速度（步/帧）
const LERP = 0.085;        // 目标→实际的平滑系数（惯性）
const RESUME_MS = 3000;    // 交互后多久恢复自动播放
const GAP_PX = 10;         // 照片之间的最小间距（碰撞检测用）
const FIXED_TITLE = "Dystate"; // 固定在屏幕中央的标题

// 一组分散、互不相邻的锚点；相邻索引用跨步分配 → 同屏的相邻照片落在彼此远处
const ANCHORS: [number, number][] = [
  [0.17, 0.30], [0.83, 0.27], [0.15, 0.70], [0.85, 0.72],
  [0.50, 0.15], [0.50, 0.85], [0.29, 0.52], [0.71, 0.50],
];
const ANCHOR_STRIDE = 3; // 与 ANCHORS.length(8) 互质，保证连续索引被打散

type Props = {
  albumTitle: string;
  photos: AlbumPhoto[];
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** 单张图片（无 src 时回退到渐变占位） */
function Frame({ photo }: { photo: AlbumPhoto }) {
  const [a, b] = photo.accent ?? ["#2a2a2a", "#0a0a0a"];
  return (
    <>
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.title}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover select-none"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 120% at 50% 30%, ${a}, ${b})` }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom,rgba(0,0,0,.10) 0 1px,transparent 1px 3px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 40%, transparent 60%, rgba(0,0,0,.45))" }}
      />
    </>
  );
}

export default function ScrollZoomGallery({ albumTitle, photos }: Props) {
  const reduce = useReducedMotion();
  const n = photos.length;

  // 每张照片的确定性布局：分散锚点（带微抖动）+ 偏小尺寸 + 横竖
  const layout = useMemo(
    () =>
      photos.map((_, i) => {
        const rnd = (k: number) => {
          const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        const a = ANCHORS[(i * ANCHOR_STRIDE) % ANCHORS.length];
        return {
          ax: clamp01(a[0] + (rnd(1) - 0.5) * 0.05),
          ay: clamp01(a[1] + (rnd(2) - 0.5) * 0.05),
          vw: 14 + rnd(3) * 8, // 14..22 vw（偏小，避免重叠）
          portrait: rnd(4) > 0.4,
        };
      }),
    [photos]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const progress = useRef(0);
  const target = useRef(0);
  const auto = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchY = useRef<number | null>(null);

  const poke = () => {
    auto.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => (auto.current = true), RESUME_MS);
  };

  useEffect(() => {
    if (n < 2) return;
    const el = containerRef.current;
    if (!el) return;

    const DEPTH = n - PASS;                 // 循环穿过点
    const VIS = Math.min(2.0, DEPTH);       // 可见深度上限（同屏最多约 3 张）
    const FADE_FAR = Math.min(1.3, VIS * 0.7);

    const onWheel = (e: WheelEvent) => { e.preventDefault(); poke(); target.current += e.deltaY * WHEEL_SENS; };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " "].includes(e.key)) { poke(); target.current += 0.7; }
      else if (["ArrowUp", "ArrowLeft"].includes(e.key)) { poke(); target.current -= 0.7; }
    };
    const onTouchStart = (e: TouchEvent) => { touchY.current = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY.current === null) return;
      const y = e.touches[0].clientY;
      const dy = touchY.current - y;
      touchY.current = y;
      poke();
      target.current += dy * TOUCH_SENS;
    };
    const onTouchEnd = () => (touchY.current = null);

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);

    let raf = 0;
    const tick = () => {
      if (auto.current && !reduce) target.current += AUTO_SPEED;
      progress.current += (target.current - progress.current) * LERP;
      const p = progress.current;
      const cw = el.clientWidth || 1;
      const ch = el.clientHeight || 1;

      // 1) 计算每张的深度 / 缩放 / 不透明度 / 屏幕矩形
      type St = { d: number; scale: number; op: number; l: number; t: number; r: number; b: number; hidden: boolean };
      const st: St[] = new Array(n);
      for (let i = 0; i < n; i++) {
        let raw = (((i - p) % n) + n) % n;
        if (raw > DEPTH) raw -= n;
        const d = raw;
        const scale = Math.min(1, Math.pow(GROWTH, -d)); // 上限 1：到前景就不再长大
        const op = smooth((VIS - d) / FADE_FAR) * smooth((d + PASS) / (PASS + FRONT));
        const L = layout[i];
        const w = (L.vw / 100) * cw * scale;
        const h = w / (L.portrait ? 0.75 : 1.3333);
        const cx = L.ax * cw;
        const cy = L.ay * ch;
        st[i] = { d, scale, op, l: cx - w / 2, t: cy - h / 2, r: cx + w / 2, b: cy + h / 2, hidden: false };
      }

      // 2) 碰撞检测：按不透明度从高到低，后来者与已接受者相交则隐藏（硬保证不重叠）
      const order = st
        .map((s, i) => ({ s, i }))
        .filter((x) => x.s.op > 0.01)
        .sort((a, b) => b.s.op - a.s.op);
      const acc: St[] = [];
      for (const { s } of order) {
        const hit = acc.some(
          (a) => !(s.r <= a.l - GAP_PX || s.l >= a.r + GAP_PX || s.b <= a.t - GAP_PX || s.t >= a.b + GAP_PX)
        );
        if (hit) s.hidden = true;
        else acc.push(s);
      }

      // 3) 应用到 DOM
      for (let i = 0; i < n; i++) {
        const s = st[i];
        const node = layerRefs.current[i];
        if (!node) continue;
        const op = s.op <= 0.01 || s.hidden ? 0 : s.op;
        node.style.opacity = String(op);
        node.style.visibility = op < 0.003 ? "hidden" : "visible";
        node.style.zIndex = String(Math.round(1000 - s.d * 20));
        node.style.transform = `translate3d(-50%,-50%,0) scale(${s.scale.toFixed(4)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [n, reduce, layout]);

  if (n === 0) {
    return (
      <main className="grid min-h-dvh place-items-center bg-black text-white/60">
        <p className="font-nokia text-sm tracking-[0.2em]">暂无图片</p>
      </main>
    );
  }

  return (
    <main
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden bg-black text-white touch-none isolate"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      {/* 顶部：返回 + 作品名 */}
      <header className="absolute top-0 inset-x-0 z-[4000] flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <a href="/album" className="text-[14px] tracking-[0.12em] text-white/70 hover:text-white transition-colors" style={{ fontWeight: 800 }}>
          ← ALBUM
        </a>
        <span className="text-[14px] tracking-[0.12em] text-white/70" style={{ fontWeight: 800 }}>
          {albumTitle}
        </span>
      </header>

      {/* 散落的照片隧道层 */}
      <div className="absolute inset-0">
        {photos.map((photo, i) => {
          const L = layout[i];
          return (
            <div
              key={i}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
              className="absolute overflow-hidden bg-black"
              style={{
                left: n < 2 ? "50%" : `${L.ax * 100}%`,
                top: n < 2 ? "50%" : `${L.ay * 100}%`,
                width: n < 2 ? "clamp(280px,42vw,560px)" : `${L.vw.toFixed(2)}vw`,
                aspectRatio: n < 2 ? "4 / 3" : L.portrait ? "3 / 4" : "4 / 3",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                transform:
                  n < 2 ? "translate3d(-50%,-50%,0) scale(1)" : "translate3d(-50%,-50%,0) scale(0.001)",
              }}
            >
              <Frame photo={photo} />
            </div>
          );
        })}
      </div>

      {/* 固定在屏幕中央的大号衬线标题（mix-blend 压在照片上自然反相） */}
      <div className="pointer-events-none absolute inset-0 z-[3000] grid place-items-center">
        <h1
          className="whitespace-nowrap italic leading-none tracking-tight text-white"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(64px,12vw,170px)",
            mixBlendMode: "difference",
          }}
        >
          {FIXED_TITLE}
        </h1>
      </div>

      {/* 底部操作说明 */}
      <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-[4000] flex flex-col items-center gap-1 px-4 text-center">
        <p className="text-[11px] sm:text-[12px] tracking-[0.18em] text-white/70 uppercase" style={{ fontWeight: 800 }}>
          Use mouse wheel, arrow keys, or touch to navigate
        </p>
        <p className="font-nokia text-[10px] sm:text-[11px] tracking-[0.2em] text-white/35 uppercase">
          Auto-play resumes after 3 seconds of inactivity
        </p>
      </div>
    </main>
  );
}
