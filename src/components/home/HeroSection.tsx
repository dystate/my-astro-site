import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4";

/* ─────────────────────────────────────────────
   桌面端（≥769px）：门缝光束 Hero
   布局参考 MetricHub：左上 logo / 居中导航 / 右上 Login，
   纯黑背景 + 底部光缝向上散开成光柱。
   移动端（≤768px）继续用下方的 Hero（视频背景 + MENU），不动。
   ───────────────────────────────────────────── */
function BeamHero() {
  const [loginHint, setLoginHint] = useState(false);

  // Login 空壳：点击只弹出提示，2 秒后自动消失
  useEffect(() => {
    if (!loginHint) return;
    const t = setTimeout(() => setLoginHint(false), 2000);
    return () => clearTimeout(t);
  }, [loginHint]);

  return (
    <section className="beam-hero">
      {/* 背景：门缝光束（纯 CSS，无图片） */}
      <div className="beam-hero__bg" aria-hidden="true">
        <i className="beam-hero__halo" />
        <i className="beam-hero__seam" />
        <i className="beam-hero__cone" />
        <i className="beam-hero__core" />
      </div>

      <header className="beam-header">
        <a className="beam-header__logo" href="/">Dystate</a>
        <nav className="beam-header__nav" aria-label="Site navigation">
          <a href="/album">ALBUM</a>
          <a href="/logs">LOGS</a>
        </nav>
        <div className="beam-header__login">
          <button type="button" onClick={() => setLoginHint(true)}>Login</button>
          {loginHint && <span className="beam-header__hint">登录功能还没接好，先随便逛逛</span>}
        </div>
      </header>

      <div className="beam-hero__content">
        <div className="beam-hero__headline">
          <h1>先别开灯</h1>
          <div className="beam-hero__dashes" aria-hidden="true"><i /><i /><i /></div>
        </div>
        <a className="beam-hero__cta" href="/album">
          推开门
        </a>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="serene-hero">
      <video className="serene-hero__video" autoPlay muted loop playsInline src={VIDEO_URL} />
      <div className="serene-hero__overlay" />
      <MobileMenu />
      <header className="constellation-header serene-header">
        <div className="constellation-logo">Dystate</div>
        <nav className="constellation-nav" aria-label="Site navigation">
          <span className="constellation-nav-right"><a href="/album">ALBUM</a><a href="/logs">LOGS</a></span>
        </nav>
      </header>
      <div className="serene-hero__content">
        <h1>Gentle touch.<br /><em>Radiant presence.</em></h1>
        <p>Expert beauty and holistic wellness, delivered with warmth and intention.</p>
      </div>
      <div className="serene-sound" aria-label="Experience with sound">
        <span className="serene-sound__icon"><i /></span>
        <span>Experience<br />with sound</span>
      </div>
    </section>
  );
}

export default function HeroSection() {
  return (
    <main className="serene-page">
      <BeamHero />
      <Hero />
    </main>
  );
}
