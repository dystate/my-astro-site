import { useState } from "react";
import MobileMenu from "./MobileMenu";
import { SITE_NAV } from "../../data/siteNav";
import type { CSSProperties } from "react";

/**
 * Full-bleed lamp hero.
 *
 * The wall switch is the only control for the lamp.
 */
export default function HeroSection() {
  const [isOn, setIsOn] = useState(false);

  return (
    <main className={`lamp-page${isOn ? " is-on" : ""}`}>
      <section className="lamp-hero" aria-label="台灯互动场景">
        <div className="lamp-scene" aria-hidden="true">
          <picture>
            <source
              media="(max-width: 639.98px)"
              srcSet="/images/hero-lamp-mobile-off.png"
            />
            <img
              className="lamp-scene__image lamp-scene__image--off"
              src="/images/hero-lamp-off.png"
              alt=""
            />
          </picture>
          <picture>
            <source
              media="(max-width: 639.98px)"
              srcSet="/images/hero-lamp-mobile-on.png"
            />
            <img
              className="lamp-scene__image lamp-scene__image--on"
              src="/images/hero-lamp-on.png"
              alt=""
            />
          </picture>
        </div>

        <header className="lamp-header">
          <nav className="lamp-header__nav" aria-label="Site navigation">
            {SITE_NAV.map((item) => (
              <a key={item.key} href={item.href} style={{ "--nav-accent": item.accent } as CSSProperties}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        <MobileMenu />

        <h1 className="lamp-greeting">
          <span>Hello，</span>
          <span>World</span>
        </h1>

        {isOn && (
          <a
            className="lamp-bulb-link"
            href="/light-room"
            aria-label="通过灯泡进入特别页面"
          />
        )}

        <button
          type="button"
          className={`wall-switch${isOn ? " is-on" : ""}`}
          onClick={() => setIsOn((value) => !value)}
          aria-pressed={isOn}
          aria-label={isOn ? "关闭台灯" : "打开台灯"}
        >
          <span className="wall-switch__images" aria-hidden="true">
            <img
              className="wall-switch__image wall-switch__image--off"
              src="/images/switch-off.png"
              alt=""
            />
            <img
              className="wall-switch__image wall-switch__image--on"
              src="/images/switch-on.png"
              alt=""
            />
          </span>
        </button>

      </section>
    </main>
  );
}
