import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

/* ─────────────────────────────────────────────
   像素十字图标 (+ ↔ ✕ 通过旋转 45° 切换)
   用 9 个小方块拼成十字，呈现 Podium 那种点阵质感
   ───────────────────────────────────────────── */
function PixelCross({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  // 5x5 网格，方块 4、间距 1（步长 5）
  const cells = [
    // 竖臂（中间列 c=2）
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    // 横臂（中间行 r=2，去掉已存在的中心）
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

const LINKS = [
  { label: "ALBUM", href: "/album" },
  { label: "LOGS", href: "/logs" },
  { label: "MYDAN", href: "/woaidan" },
];

const SOCIALS = [
  { label: "TIKTOK", href: "https://douyin.com" },
  { label: "VIMEO", href: "https://vimeo.com" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // 打开时锁定页面滚动
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
    // sm:hidden → 仅移动端渲染
    <div className="sm:hidden">
      {/* 右上角按钮 — MENU / CLOSE 共用，旋转加号动画切换 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed top-4 right-4 z-[80] flex items-center gap-2",
          open ? "text-white" : "text-[#1a1a1a]",
        ].join(" ")}
        style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
        aria-label={open ? "关闭菜单" : "打开菜单"}
      >
        <span className="text-[22px] tracking-[0.04em] leading-none">
          {open ? "CLOSE" : "MENU"}
        </span>
        <motion.span
          className="inline-flex"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <PixelCross size={20} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[70] flex flex-col bg-black text-white"
          >
            {/* 顶部：仅 Logo，位置与主页一致 */}
            <div className="absolute top-0 left-0 p-4">
              <span
                className="text-[28px] leading-none tracking-[-0.02em]"
                style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
              >
                Dystate
              </span>
            </div>

            {/* 主导航：右对齐大标题 */}
            <nav className="flex flex-1 flex-col items-end justify-center px-4">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.12 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-[64px] leading-[0.95] tracking-[-0.02em]"
                  style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            {/* 底部：社交链接，右下角 */}
            <div className="flex flex-col items-end gap-1 p-4 pb-8">
              {SOCIALS.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
                  className="text-[16px] tracking-[0.04em] leading-tight"
                  style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
                >
                  {s.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
