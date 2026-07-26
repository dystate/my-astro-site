import { useEffect, useRef, type ReactNode } from "react";
import MobileMenu from "./MobileMenu";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4";
const RAINBOW_URL = "https://soft-zoom-63098134.figma.site/_assets/v11/8d520a7515d06cbfc403d0125e3d05b1a7ccd29c.png";
const CLOUD_URL = "https://soft-zoom-63098134.figma.site/_assets/v11/0d6dfd3f90b930f21726f2ed56a3320d79b7a797.png";

function Button({ children, href }: { children: ReactNode; href: string }) {
  return <a href={href} className="serene-button">{children}</a>;
}

function Hero() {
  return (
    <section className="serene-hero">
      <video className="serene-hero__video" autoPlay muted loop playsInline poster="/images/graduate.jpg" src={VIDEO_URL} />
      <div className="serene-hero__overlay" />
      <MobileMenu />
      <header className="constellation-header serene-header">
        <div className="constellation-logo">Dystate</div>
        <nav className="constellation-nav" aria-label="Site navigation">
          <span className="constellation-nav-right"><a href="/album">ALBUM</a><a href="/logs">LOGS</a><a href="/woaidan">MYDAN</a></span>
        </nav>
      </header>
      <div className="serene-hero__content">
        <h1>Gentle touch.<br /><em>Radiant presence.</em></h1>
        <p>Expert beauty and holistic wellness, delivered with warmth and intention.</p>
        <Button href="#serene-quote">Begin your renewal</Button>
      </div>
      <div className="serene-sound" aria-label="Experience with sound">
        <span className="serene-sound__icon"><i /></span>
        <span>Experience<br />with sound</span>
      </div>
    </section>
  );
}

function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const rainbowRef = useRef<HTMLImageElement>(null);
  const leftCloudRef = useRef<HTMLImageElement>(null);
  const rightCloudRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const rainbow = rainbowRef.current;
    const leftCloud = leftCloudRef.current;
    const rightCloud = rightCloudRef.current;
    if (!section || !rainbow || !leftCloud || !rightCloud) return;
    let frame = 0;
    const current = { rainbowY: 120, leftX: -200, rightX: 200, cloudY: 0, leftOpacity: 0, rightOpacity: 0 };
    const lerp = (from: number, to: number, factor: number) => from + (to - from) * factor;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
      const cloudProgress = Math.min(1, Math.max(0, (progress - .12) / .8));
      const leftTarget = -200 + cloudProgress * 200;
      const rightTarget = 200 - cloudProgress * 200;
      current.rainbowY = lerp(current.rainbowY, 120 - progress * 280, .06);
      current.leftX = lerp(current.leftX, leftTarget, .04);
      current.rightX = lerp(current.rightX, rightTarget, .04);
      current.cloudY = lerp(current.cloudY, progress * -50, .04);
      current.leftOpacity = lerp(current.leftOpacity, Math.min(1, cloudProgress * 1.8), .04);
      current.rightOpacity = lerp(current.rightOpacity, Math.min(1, cloudProgress * 1.8), .04);
      rainbow.style.transform = `translate3d(0, ${current.rainbowY}px, 0)`;
      leftCloud.style.transform = `translate3d(${current.leftX}px, ${current.cloudY}px, 0)`;
      rightCloud.style.transform = `translate3d(${current.rightX}px, ${current.cloudY}px, 0) scaleX(-1)`;
      leftCloud.style.opacity = `${current.leftOpacity}`;
      rightCloud.style.opacity = `${current.rightOpacity}`;
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section ref={sectionRef} id="serene-quote" className="serene-quote">
      <img ref={rainbowRef} className="serene-quote__rainbow" src={RAINBOW_URL} alt="" />
      <img ref={leftCloudRef} className="serene-quote__cloud serene-quote__cloud--left" src={CLOUD_URL} alt="" />
      <img ref={rightCloudRef} className="serene-quote__cloud serene-quote__cloud--right" src={CLOUD_URL} alt="" />
      <div className="serene-quote__content">
        <blockquote>“Serene was founded on a belief in beauty that honors your nature. We pursue refined outcomes, considered approaches, and lasting vitality. We spend time learning what matters to you before deciding what serves you best. No rushing, no excess — just support that lets you feel radiant.”</blockquote>
        <p>Dr. Mia Callahan — Founder</p>
      </div>
    </section>
  );
}

export default function HeroSection() {
  return <main className="serene-page"><Hero /><QuoteSection /></main>;
}
