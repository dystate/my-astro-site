import { useState } from "react";
import MobileMenu from "./MobileMenu";

/* ─────────────────────────────────────────────
   拉绳台灯 Hero（桌面端 + 移动端共用）
   纯黑背景，台灯固定在页面底部正中；
   点击拉绳 → 开灯（暖黄光锥向上炸开），再点 → 关灯。
   造型来自用户提供的 Group 1.svg（拉绳拆成独立 <g> 以便做拉动动画）。
   ───────────────────────────────────────────── */
function LampHero() {
  const [on, setOn] = useState(false);
  const [pulling, setPulling] = useState(false);

  const pull = () => {
    if (pulling) return;
    setPulling(true);
    setOn((v) => !v);
    window.setTimeout(() => setPulling(false), 550);
  };

  return (
    <main className={`lamp-page${on ? " is-on" : ""}`}>
      <section className="lamp-hero">
        {/* 顶栏（与 album 页统一；移动端导航交给 MENU） */}
        <header className="lamp-header">
          <a className="lamp-header__logo" href="/">Dystate</a>
          <nav className="lamp-header__nav" aria-label="Site navigation">
            <a href="/album">ALBUM</a>
            <a href="/logs">LOGS</a>
          </nav>
        </header>
        <MobileMenu />

        {/* 页面中央大字 + 英文副标题 */}
        <div className="lamp-headline">
          <h1 className="lamp-headline__zh">先别开灯</h1>
          <p className="lamp-headline__en">Don&apos;t turn on the light yet</p>
        </div>

        {/* 底部中央：台灯 + 拉绳 */}
        <figure className="lamp-unit">
          {/* 光锥 + 光晕（仅开灯时可见，锚点在灯罩顶口，随台灯缩放） */}
          <div className="lamp-glow" aria-hidden="true">
            <i className="lamp-glow__cone" />
            <i className="lamp-glow__core" />
            <i className="lamp-glow__halo" />
          </div>
          <svg className="lamp-art" viewBox="0 0 197 255" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="lampShadeGrad" x1="2.3" y1="99.56" x2="150.3" y2="99.56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0E0E0" />
                <stop offset="0.4255" stopColor="white" />
                <stop offset="0.6636" stopColor="#D5D5D5" />
                <stop offset="1" stopColor="#999999" />
              </linearGradient>
            </defs>
            <ellipse cx="79.3" cy="254.5" rx="71" ry="37.5" fill="white" />
            <path
              d="M78.2784 249C61.0398 222.939 34.8522 208.128 68.8301 182.689C102.808 157.249 65.8886 110.708 68.8302 103"
              stroke="#F3F3F3"
              strokeWidth="6"
            />
            <path
              d="M125.112 9.5L160.297 104.811L80 109.499L0.676758 104.81L31.9736 9.5H125.112Z"
              fill="url(#lampShadeGrad)"
              stroke="black"
            />
            <path d="M122.299 9C122.299 13.9706 102.151 18 77.2986 18C52.4458 18 32.2986 13.9706 32.2986 9C32.2986 4.02944 52.4458 0 77.2986 0C102.151 0 122.299 4.02944 122.299 9Z" fill="#F5F5F5" />
            <g className={`lamp-cord${pulling ? " is-pulling" : ""}`}>
              <line x1="126.8" y1="98.9" x2="126.8" y2="143" stroke="white" strokeWidth="3" />
              <circle cx="127.3" cy="143" r="5" fill="white" />
            </g>
          </svg>
          <button
            type="button"
            className="lamp-pull"
            onClick={pull}
            aria-pressed={on}
            aria-label={on ? "拉绳关灯" : "拉绳开灯"}
          />
        </figure>
      </section>
    </main>
  );
}

export default function HeroSection() {
  return <LampHero />;
}
