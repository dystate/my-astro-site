import { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

/* ─────────────────────────────────────────────
   Typing logic (unchanged)
   ───────────────────────────────────────────── */
const MESSAGES = ["Are you here?", "Yes, I am.", "Speak soon."];
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_BEFORE_DELETE = 2000;

function useTyping(messages: string[]) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = messages[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), PAUSE_BEFORE_DELETE);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % messages.length);
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
  }, [text, deleting, index, messages]);

  return text;
}

const PHOSPHOR = "#73F59A";
const PHOSPHOR_DIM = "#3FA968";
const GLOW = "0 0 4px rgba(115,245,154,.85), 0 0 12px rgba(60,200,110,.45)";

/* Box geometry (base, in px). The whole thing scales via the `width` prop. */
const BASE = 440;
const W = 440;
const H = 430;
const D = 150;

/* Sticky note shape */
export type StickyNote = {
  text: string;
  tag?: string;
  color?: string;
  /** rotation in deg */ rot?: number;
  /** absolute position on the back face, any CSS length */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

const DEFAULT_NOTES: StickyNote[] = [
  { tag: "todo", text: "给 /life 加新照片 📷", color: "#FCF38E", rot: -6, top: "40px", left: "38px" },
  { tag: "peer", text: "drag me ↻\n有人在等你", color: "#FFC2D6", rot: 7, top: "150px", right: "34px" },
  { text: "每天一条\n就好 ☕", color: "#BFF3C9", rot: -3, bottom: "42px", left: "54px" },
];

/* a face is centered on the box origin via negative margins, then rotated + pushed out */
function faceStyle(
  w: number,
  h: number,
  transform: string
): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: w,
    height: h,
    marginTop: -h / 2,
    marginLeft: -w / 2,
    transform,
  };
}

export default function RetroComputer({
  className = "",
  width = 586,
  messages = MESSAGES,
  notes = DEFAULT_NOTES,
}: {
  className?: string;
  /** rendered pixel width of the device */
  width?: number;
  messages?: string[];
  notes?: StickyNote[];
}) {
  const text = useTyping(messages);
  const reduce = useReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);

  // rotation targets (driven by pointer + inertia), smoothed by springs
  const rotXTarget = useMotionValue(-8);
  const rotYTarget = useMotionValue(-22);
  const rotX = useSpring(rotXTarget, { stiffness: 90, damping: 18, mass: 0.6 });
  const rotY = useSpring(rotYTarget, { stiffness: 90, damping: 18, mass: 0.6 });
  const transform = useMotionTemplate`rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let dragging = false;
    let lastX = 0,
      lastY = 0,
      lastT = 0;
    let velY = 0;
    let raf = 0;
    const SENS = 0.45;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      velY = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      stage.style.cursor = "grabbing";
      stage.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotYTarget.set(rotYTarget.get() + dx * SENS);
      rotXTarget.set(
        Math.max(-32, Math.min(32, rotXTarget.get() - dy * SENS))
      );
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velY = ((dx * SENS) / dt) * 16;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };
    const onUp = () => {
      dragging = false;
      stage.style.cursor = "grab";
    };

    const loop = () => {
      if (!dragging) {
        if (Math.abs(velY) > 0.02) {
          rotYTarget.set(rotYTarget.get() + velY);
          velY *= 0.94;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [rotXTarget, rotYTarget]);

  const scale = width / BASE;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width, height: H * scale }}
    >
      {/* scale wrapper keeps the 3D math at BASE px, then scales to `width` */}
      <div
        style={{
          width: BASE,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* stage holds the perspective */}
        <div
          ref={stageRef}
          className="relative"
          style={{
            width: W,
            height: H,
            perspective: 1500,
            perspectiveOrigin: "50% 42%",
            cursor: "grab",
            touchAction: "none",
          }}
        >
          {/* idle float wrapper */}
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            animate={reduce ? {} : { y: [-6, 10, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* the rotating box */}
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", transform }}
            >
              {/* ── FRONT ── */}
              <div
                style={{
                  ...faceStyle(W, H, `translateZ(${D / 2}px)`),
                  overflow: "hidden",
                  backfaceVisibility: "hidden",
                  background:
                    "linear-gradient(180deg,#ECE6D6 0%,#DCD4BF 46%,#C6BCA0 100%)",
                  border: "1px solid rgba(120,108,80,.35)",
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,.65), inset 0 -7px 14px rgba(120,108,80,.4)",
                  padding: "22px 22px 0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* bezel */}
                <div
                  style={{
                    position: "relative",
                    padding: 14,
                    background:
                      "linear-gradient(180deg,#23231f 0%,#15140f 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.4)",
                  }}
                >
                  {/* glass screen */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 3",
                      width: "100%",
                      overflow: "hidden",
                      background:
                        "radial-gradient(120% 120% at 50% 38%,#12211a 0%,#0a130e 58%,#040805 100%)",
                      boxShadow: "inset 0 0 46px 8px rgba(0,0,0,.85)",
                    }}
                  >
                    {/* terminal */}
                    <div
                      className="font-nokia"
                      style={{
                        position: "absolute",
                        inset: 0,
                        padding: 16,
                        textAlign: "left",
                        fontSize: 13,
                        lineHeight: 1.15,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        color: PHOSPHOR,
                        textShadow: GLOW,
                      }}
                    >
                      <span style={{ color: PHOSPHOR_DIM }}>DST TERMINAL v1.0</span>
                      <span style={{ color: PHOSPHOR_DIM }}>
                        PEER CONNECTED &#9702;
                      </span>
                      <span style={{ marginTop: 6, wordBreak: "break-word" }}>
                        &gt; {text}
                        <motion.span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 13,
                            marginLeft: 4,
                            verticalAlign: "middle",
                            background: PHOSPHOR,
                            boxShadow: GLOW,
                          }}
                          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </span>
                    </div>

                    {/* scanlines / gloss / flicker */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to bottom,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)",
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(155deg,rgba(255,255,255,.10) 0%,transparent 38%)",
                      }}
                    />
                    {!reduce && (
                      <motion.div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: PHOSPHOR }}
                        animate={{ opacity: [0.015, 0.05, 0.02, 0.045, 0.02] }}
                        transition={{
                          duration: 0.18,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* underbar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 4px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span
                      className="font-instrument"
                      style={{ fontSize: 24, lineHeight: 1, color: "#5b5340" }}
                    >
                      dst.
                    </span>
                    <span
                      className="font-sans"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#8a8068",
                        marginLeft: 8,
                      }}
                    >
                      Model DST-1
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 2,
                            height: 13,
                            borderRadius: 9,
                            background: "rgba(120,108,80,.5)",
                          }}
                        />
                      ))}
                    </div>
                    <motion.span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#8affa0",
                        boxShadow: "0 0 6px 1px rgba(120,255,150,.9)",
                        marginLeft: 12,
                      }}
                      animate={reduce ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* ── BACK ── */}
              <div
                style={{
                  ...faceStyle(W, H, `rotateY(180deg) translateZ(${D / 2}px)`),
                  overflow: "hidden",
                  backfaceVisibility: "hidden",
                  background:
                    "linear-gradient(180deg,#D6CEB7 0%,#BFB59B 58%,#A89E82 100%)",
                  border: "1px solid rgba(120,108,80,.4)",
                  boxShadow:
                    "inset 0 2px 0 rgba(255,255,255,.4), inset 0 -8px 16px rgba(90,80,55,.4)",
                }}
              >
                {/* vent grille */}
                <div
                  style={{
                    position: "absolute",
                    top: 26,
                    left: 26,
                    right: 26,
                    height: 150,
                    borderRadius: 10,
                    background:
                      "repeating-linear-gradient(180deg,rgba(60,50,28,.55) 0 3px,rgba(255,255,255,.12) 3px 5px,transparent 5px 13px)",
                    boxShadow: "inset 0 0 10px rgba(60,50,28,.5)",
                    opacity: 0.85,
                  }}
                />
                {/* screws */}
                {(
                  [
                    { top: 12, left: 12 },
                    { top: 12, right: 12 },
                    { bottom: 12, left: 12 },
                    { bottom: 12, right: 12 },
                  ] as React.CSSProperties[]
                ).map((pos, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 30%,#efe9da,#9a9176 70%,#6f664f)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,.5),0 1px 1px rgba(0,0,0,.3)",
                      ...pos,
                    }}
                  />
                ))}
                {/* spec label */}
                <div
                  className="font-nokia"
                  style={{
                    position: "absolute",
                    left: 26,
                    bottom: 30,
                    width: 172,
                    padding: "9px 11px",
                    borderRadius: 6,
                    background: "#f4f0e3",
                    border: "1px solid rgba(120,108,80,.45)",
                    boxShadow: "0 1px 2px rgba(0,0,0,.18)",
                    fontSize: 12,
                    lineHeight: 1.25,
                    color: "#4a4636",
                    transform: "rotate(-1.5deg)",
                  }}
                >
                  <span style={{ color: "#1f1d16" }}>DST-1</span> PERSONAL TERMINAL
                  <br />
                  SN&nbsp;0xAE1F&middot;9C
                  <br />
                  12V&#9096; &#9211; MADE FOR YOU
                </div>
                {/* cable grommet */}
                <div
                  style={{
                    position: "absolute",
                    right: 30,
                    bottom: 24,
                    width: 54,
                    height: 20,
                    borderRadius: 11,
                    background: "linear-gradient(180deg,#3a3424,#1c180f)",
                    boxShadow:
                      "inset 0 2px 3px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.25)",
                  }}
                />

                {/* sticky notes */}
                {notes.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 108,
                      minHeight: 96,
                      padding: "12px 11px 14px",
                      whiteSpace: "pre-line",
                      fontFamily: '"Caveat","Comic Sans MS",cursive',
                      fontSize: 18,
                      lineHeight: 1.15,
                      color: "#2a2a22",
                      background: n.color ?? "#FCF38E",
                      boxShadow: "2px 6px 10px -4px rgba(40,34,18,.45)",
                      transform: `rotate(${n.rot ?? 0}deg)`,
                      top: n.top,
                      bottom: n.bottom,
                      left: n.left,
                      right: n.right,
                    }}
                  >
                    {n.tag && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          letterSpacing: "0.04em",
                          opacity: 0.55,
                          marginBottom: 4,
                        }}
                      >
                        {n.tag}
                      </span>
                    )}
                    {n.text}
                  </div>
                ))}
              </div>

              {/* ── SIDES ── */}
              <div
                style={{
                  ...faceStyle(D, H, `rotateY(90deg) translateZ(${W / 2}px)`),
                  background: "linear-gradient(90deg,#C9C0A6,#A89E81)",
                }}
              />
              <div
                style={{
                  ...faceStyle(D, H, `rotateY(-90deg) translateZ(${W / 2}px)`),
                  background: "linear-gradient(90deg,#B4AA8C,#CBC2A8)",
                }}
              />
              <div
                style={{
                  ...faceStyle(W, D, `rotateX(90deg) translateZ(${H / 2}px)`),
                  background: "linear-gradient(180deg,#F0EADB,#D8D0BA)",
                }}
              />
              <div
                style={{
                  ...faceStyle(W, D, `rotateX(-90deg) translateZ(${H / 2}px)`),
                  background: "linear-gradient(180deg,#B0A78C,#938A70)",
                }}
              />
            </motion.div>
          </motion.div>

          {/* ground contact shadow */}
          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -80,
              width: 340,
              height: 54,
              x: "-50%",
              background:
                "radial-gradient(ellipse 50% 50% at 50% 50%,rgba(60,50,28,.32),transparent 72%)",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>

    </div>
  );
}