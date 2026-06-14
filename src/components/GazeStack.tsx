// src/components/GazeStack.tsx
// React 岛:滚动弹簧入场 + 点击跳转。数据来自原 GazeGallery。
import { motion } from "motion/react";
import type { Variants } from "motion/react";

type Work = {
  href: string;
  eyebrow: string;   // 编号
  title: string;     // 大标题
  sub: string;       // 副标题
  corner?: string;   // 右上角标图(可选)
  hueA: number;      // 背景色块渐变起
  hueB: number;      // 背景色块渐变止
};

const works: Work[] = [
  { href: "/person",  eyebrow: "1", title: "人类的世界", sub: "感受 Feeling",   corner: "/images/dst.png",    hueA: 38, hueB: 18 },
  { href: "/life",    eyebrow: "2", title: "自然的颜色", sub: "记录 Recording", corner: "/images/nature.png", hueA: 48, hueB: 26 },
  { href: "/study",   eyebrow: "4", title: "学习的脚步", sub: "创造 Creating",  corner: "/images/lg.png",     hueA: 28, hueB: 8 },
  { href: "/woaidan", eyebrow: "5", title: "永久的春天", sub: "灵魂 Elevating", corner: "/images/spring.png", hueA: 42, hueB: 22 },
];

export default function GazeStack() {
  return (
    <div style={container}>
      {works.map((w, i) => (
        <Card key={w.href} work={w} i={i} />
      ))}
    </div>
  );
}

function Card({ work }: { work: Work; i: number }) {
  const background = `linear-gradient(306deg, ${hue(work.hueA)}, ${hue(work.hueB)})`;

  return (
    <motion.div
      style={cardContainer}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.7 }}
    >
      <div style={{ ...splash, background }} />

      <motion.a
        href={work.href}
        style={card}
        variants={cardVariants}
        whileHover={{ scale: 1.03, rotate: 0 }}
        whileTap={{ scale: 0.98 }}
        className="gaze-stack-card"
      >
        {work.corner && (
          <img src={work.corner} alt="" aria-hidden="true" style={cornerStyle} />
        )}
        <span style={eyebrowStyle}>{work.eyebrow}</span>
        <h3 style={titleStyle}>{work.title}</h3>
        <p style={subStyle}>{work.sub}</p>
        <span style={cueStyle}>View →</span>
      </motion.a>
    </motion.div>
  );
}

const cardVariants: Variants = {
  offscreen: { y: 220, rotate: -8, opacity: 0 },
  onscreen: {
    y: 0,
    rotate: -2,
    opacity: 1,
    transition: { type: "spring", bounce: 0.4, duration: 0.9 },
  },
};

const hue = (h: number) => `hsl(${h}, 85%, 52%)`;

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: 460,
  padding: "120px 24px 160px",
  width: "100%",
};

const cardContainer: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 20,
  marginBottom: -90,
};

const splash: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  clipPath:
    'path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")',
  opacity: 0.9,
};

const card: React.CSSProperties = {
  position: "relative",
  width: 320,
  height: 440,
  display: "flex",
  flexDirection: "column",
  padding: "34px 30px",
  borderRadius: 14,
  background: "#ffffff",
  color: "#1a1208",
  textDecoration: "none",
  boxShadow:
    "0 0 1px hsl(0 0% 0% / .08), 0 8px 18px hsl(0 0% 0% / .18), 0 18px 40px hsl(0 0% 0% / .22)",
  transformOrigin: "10% 60%",
  overflow: "hidden",
};

const cornerStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "46%",
  height: "auto",
  opacity: 0.9,
};

const eyebrowStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  font: '700 13px/1 "Helvetica Neue", Arial, sans-serif',
  color: "#fff7ec",
  background: "#1a1208",
  padding: "4px 10px",
};

const titleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  font: '800 44px/1.08 "Noto Serif SC", "Noto Serif JP", "Songti SC", serif',
  letterSpacing: "0.04em",
};

const subStyle: React.CSSProperties = {
  margin: "12px 0 0",
  font: '500 14px/1.5 "Noto Sans SC", system-ui, sans-serif',
  opacity: 0.85,
  letterSpacing: "0.05em",
};

const cueStyle: React.CSSProperties = {
  marginTop: "auto",
  font: '600 12px/1 "Helvetica Neue", Arial, sans-serif',
  letterSpacing: "0.1em",
};