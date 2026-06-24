import { useState, useEffect } from "react";
import { motion } from "motion/react";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import MobileMenu from "./MobileMenu";


export default function HeroSection() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section className="relative flex h-dvh flex-col items-center justify-center bg-black overflow-hidden">
      {/* 移动端右上角菜单 */}
      <MobileMenu />

      {/* Logo — 左上角，移动端28px，桌面端双倍 */}
      <div className="absolute top-0 left-0 p-4 sm:p-6">
        <span
          className="text-[28px] sm:text-[56px] tracking-[-0.02em] text-white leading-none"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
        >
          Dystate
        </span>
      </div>

      {/* 桌面端右上角导航 — 移动端隐藏 */}
      <nav
        className="hidden sm:flex absolute top-0 right-0 p-4 sm:p-6 items-center gap-6 sm:gap-10"
        style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
      >
        <a href="/album" className="text-[18px] sm:text-[18px] tracking-[0.04em] text-white leading-none hover:opacity-60 transition-opacity">ALBUM</a>
        <a href="/logs" className="text-[18px] sm:text-[18px] tracking-[0.04em] text-white leading-none hover:opacity-60 transition-opacity">LOGS</a>
        <a href="/woaidan" className="text-[18px] sm:text-[18px] tracking-[0.04em] text-white leading-none hover:opacity-60 transition-opacity">MYDAN</a>
      </nav>

      {/* 地球 — 移动端整体上移 */}
      <div className="-translate-y-[45px] sm:translate-y-0">
        <RotatingEarth width={mobile ? 320 : 560} height={mobile ? 320 : 560} />
      </div>

      {/* 文字 — 左下角 */}
      <div className="absolute left-0 bottom-0 text-left max-w-[70vw] sm:max-w-sm p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[38px] sm:text-[38px] md:text-[46px] leading-[0.95] tracking-tight text-white mb-2 sm:mb-3"
        >
          Weekly update. <br /> Daily Progress.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[18px] sm:text-[22px] md:text-[22px] font-normal leading-relaxed text-white/60"
        >
          Hi, this is Dystate.
          Welcome to my channel!
        </motion.div>
      </div>
    </section>
  );
}
