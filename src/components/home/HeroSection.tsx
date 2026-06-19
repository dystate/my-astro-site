import { useState, useEffect } from "react";
import { motion } from "motion/react";
import RetroComputer from "./RetroComputer";
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
    <section className="relative flex h-dvh flex-col items-center justify-center bg-[#F3F4ED] overflow-hidden">
      {/* 移动端右上角菜单 */}
      <MobileMenu />

      {/* Logo — 左上角，与 MobileMenu overlay 内 logo 位置一致 */}
      <div className="absolute top-0 left-0 p-4">
        <span
          className="text-[58px] sm:text-[28px] tracking-[-0.02em] text-[#1a1a1a] leading-none"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
        >
          Dystate
        </span>
      </div>

      {/* 电脑 — 移动端整体上移 */}
      <div className="-translate-y-[45px] sm:translate-y-0">
        <RetroComputer width={mobile ? 250 : 500} />
      </div>

      {/* 文字 — 左下角 */}
      <div className="absolute left-0 bottom-0 text-left max-w-[70vw] sm:max-w-sm p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[18px] sm:text-[38px] md:text-[46px] leading-[0.95] tracking-tight text-[#1a1a1a] mb-2 sm:mb-3"
        >
          Weekly update. <br /> Daily Progress.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[11px] sm:text-[14px] md:text-[15px] font-normal leading-relaxed text-[#1a1a1a]/60"
        >
          Hi, this is Dystate.
          Welcome to my channel!
        </motion.div>
      </div>
    </section>
  );
}
