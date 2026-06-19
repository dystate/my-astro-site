import { motion } from "motion/react";
import RetroComputer from "./RetroComputer";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#F3F4ED] px-4">
      {/* Logo — 左上角 */}
      <div className="absolute top-8 left-8">
        <span
          className="text-[45px] tracking-[-0.02em] text-[#1a1a1a]"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 800 }}
        >
          Dystate
        </span>
      </div>

      {/* 电脑 */}
      <RetroComputer width={500} />

      {/* 文字 — 右下角，左对齐 */}
      <div className="absolute left-8 bottom-8 text-left max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[28px] md:text-[36px] leading-[0.95] tracking-tight text-[#1a1a1a] mb-3"
        >
          Short notes. <br /> Daily calm.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[14px] md:text-[15px] font-normal leading-relaxed text-[#1a1a1a]/60"
        >
          Linked with a single anonymous peer. One message every day. A quiet
          rhythm in the digital noise.
        </motion.div>
      </div>
      {/* Scroll down — 右下角 */}
      <div className="absolute right-8 bottom-8 text-right">
        <span className="font-sans text-[12px] tracking-[0.2em] uppercase text-[#1a1a1a]/40">
          Scroll down
        </span>
      </div>
    </section>
  );
}
