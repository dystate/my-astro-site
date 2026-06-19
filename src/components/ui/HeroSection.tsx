import { useState, useEffect } from "react";
import { motion } from "motion/react";

/* ─────────────────────────────────────────────
   TypingMessages
   ───────────────────────────────────────────── */
const MESSAGES = ["Are you here?", "Yes, I am.", "Speak soon."];

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_BEFORE_DELETE = 2000;

function TypingMessages() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = MESSAGES[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      // finished typing → pause, then start deleting
      timeout = setTimeout(() => setDeleting(true), PAUSE_BEFORE_DELETE);
    } else if (deleting && text === "") {
      // finished deleting → move to next message
      setDeleting(false);
      setIndex((i) => (i + 1) % MESSAGES.length);
    } else {
      timeout = setTimeout(
        () => {
          setText((prev) =>
            deleting
              ? current.slice(0, prev.length - 1)
              : current.slice(0, prev.length + 1)
          );
        },
        deleting ? DELETING_SPEED : TYPING_SPEED
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <div className="absolute left-[48.5%] md:left-[47.5%] lg:left-[48.5%] -translate-x-1/2 bottom-[32%] z-30 w-[110px] sm:w-[130px] flex justify-start text-left">
      <span className="font-nokia text-[#2A3616] text-[10px] sm:text-[14px] leading-tight break-words min-h-[1.5em]">
        {text}
        <motion.span
          className="inline-block w-1.5 h-3 bg-[#2A3616] ml-1 align-middle"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────── */
const NAV_LINKS = ["Philosophy", "Trust", "Access", "Tribe"];

function Navbar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between rounded-full border border-black/10 bg-transparent backdrop-blur-md px-4 py-2">
        {/* Logo */}
        <span className="font-instrument text-[28px] tracking-tight text-[#1a1a1a] leading-none">
          dot.
        </span>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              className="font-sans text-[14px] text-[#1a1a1a] transition-opacity hover:opacity-60"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button className="group relative overflow-hidden rounded-full bg-[#0871E7] px-5 py-2 font-sans text-[14px] text-white shadow-[inset_0_-4px_4px_rgba(255,255,255,0.39)] outline outline-1 outline-[#0871E7] -outline-offset-1">
          {/* top glint */}
          <span className="pointer-events-none absolute left-[10%] top-[1px] h-4 w-[80%] rounded-[12px] bg-gradient-to-b from-[#DEF0FC] to-transparent transition-transform duration-300 group-hover:scale-x-105" />
          <span className="relative">Link up</span>
        </button>
      </nav>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────── */
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260427_054418_a6d194f0-ac86-4df9-abe5-ded73e596d7c.mp4";

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center bg-[#F3F4ED] pt-24 md:pt-32">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Slight tint */}
      <div className="absolute inset-0 z-10 bg-white/5" />

      {/* Typed messages on the phone screen */}
      <TypingMessages />

      {/* Hero text */}
      <div className="relative z-20 pointer-events-none px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-instrument text-[38px] md:text-[56px] lg:text-[72px] leading-[0.85] tracking-tight text-[#1a1a1a] mb-6"
        >
          Short notes. <br /> Daily calm.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-xl font-sans text-[16px] font-normal leading-relaxed text-[#1a1a1a]/70 md:text-[18px]"
        >
          Linked with a single anonymous peer. One message every day. A quiet
          rhythm in the digital noise.
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Exported island
   In Astro: <HeroSection client:load />
   ───────────────────────────────────────────── */
export default function HeroSection() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
