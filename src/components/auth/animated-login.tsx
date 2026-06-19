// src/components/ui/animated-login.tsx
import { useState, useEffect, useRef } from "react";
import SignInBlock from "./sign-in-block";

/* ───────────────── 只有瞳孔（无眼白）的眼睛 ───────────────── */
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined)
      return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  };

  const p = pos();
  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

/* ───────────────── 带眼白 + 瞳孔、可眨眼的眼睛 ───────────────── */
interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = () => {
    if (forceLookX !== undefined && forceLookY !== undefined)
      return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  };

  const p = pos();
  return (
    <div
      ref={ref}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${p.x}px, ${p.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

/* ───────────────── 登录页 ───────────────── */
export default function AnimatedLogin() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // 任意输入框聚焦
  const [isPasswordMode, setIsPasswordMode] = useState(false); // 密码框聚焦
  const [lookEachOther, setLookEachOther] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  /* 鼠标位置 */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* 随机眨眼 */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = (set: (v: boolean) => void) => {
      t = setTimeout(() => {
        set(true);
        setTimeout(() => {
          set(false);
          loop(set);
        }, 150);
      }, Math.random() * 4000 + 3000);
    };
    loop(setPurpleBlink);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = (set: (v: boolean) => void) => {
      t = setTimeout(() => {
        set(true);
        setTimeout(() => {
          set(false);
          loop(set);
        }, 150);
      }, Math.random() * 4000 + 3500);
    };
    loop(setBlackBlink);
    return () => clearTimeout(t);
  }, []);

  /* 开始打字时，角色先互相对望一下 */
  useEffect(() => {
    if (isTyping && !isPasswordMode) {
      setLookEachOther(true);
      const t = setTimeout(() => setLookEachOther(false), 800);
      return () => clearTimeout(t);
    }
    setLookEachOther(false);
  }, [isTyping, isPasswordMode]);

  const calc = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const purple = calc(purpleRef);
  const black = calc(blackRef);
  const yellow = calc(yellowRef);
  const orange = calc(orangeRef);

  /* 通过事件捕获感知 SignInBlock 里的输入框，无需改动 SignInBlock */
  const onFocusCapture = (e: React.FocusEvent) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
      setIsTyping(true);
      setIsPasswordMode(t.type === "password");
    }
  };
  const onBlurCapture = () => {
    setIsTyping(false);
    setIsPasswordMode(false);
  };

  // 聚焦密码框时，角色礼貌地别过头、向下看，不偷看密码
  const avert = isPasswordMode;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0d0f13] text-white select-none">
      {/* 左：动画角色面板 */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-gradient-to-br from-[#1d1736] via-[#15101f] to-[#0d0f13]">
        {/* 角色 */}
        <div className="relative z-20 flex h-[460px] items-end justify-center">
          <div className="relative" style={{ width: 550, height: 400 }}>
            {/* 紫色高个 — 最后层 */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 70,
                width: 180,
                height: isTyping && !avert ? 440 : 400,
                backgroundColor: "#6C3FF5",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform: avert
                  ? "skewX(0deg)"
                  : isTyping
                  ? `skewX(${(purple.bodySkew || 0) - 12}deg) translateX(40px)`
                  : `skewX(${purple.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: avert ? 20 : lookEachOther ? 55 : 45 + purple.faceX,
                  top: avert ? 35 : lookEachOther ? 65 : 40 + purple.faceY,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} pupilColor="#2D2D2D" isBlinking={purpleBlink}
                  forceLookX={avert ? -4 : lookEachOther ? 3 : undefined}
                  forceLookY={avert ? 5 : lookEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} pupilColor="#2D2D2D" isBlinking={purpleBlink}
                  forceLookX={avert ? -4 : lookEachOther ? 3 : undefined}
                  forceLookY={avert ? 5 : lookEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* 黑色高个 — 中层 */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 240,
                width: 120,
                height: 310,
                backgroundColor: "#2D2D2D",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform: avert
                  ? "skewX(0deg)"
                  : lookEachOther
                  ? `skewX(${(black.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : isTyping
                  ? `skewX(${(black.bodySkew || 0) * 1.5}deg)`
                  : `skewX(${black.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: avert ? 10 : lookEachOther ? 32 : 26 + black.faceX,
                  top: avert ? 28 : lookEachOther ? 12 : 32 + black.faceY,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={blackBlink}
                  forceLookX={avert ? -4 : lookEachOther ? 0 : undefined}
                  forceLookY={avert ? 5 : lookEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={blackBlink}
                  forceLookX={avert ? -4 : lookEachOther ? 0 : undefined}
                  forceLookY={avert ? 5 : lookEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* 橙色半圆 — 前左 */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 0,
                width: 240,
                height: 200,
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                zIndex: 3,
                transform: avert ? "skewX(0deg)" : `skewX(${orange.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: avert ? 50 : 82 + (orange.faceX || 0),
                  top: avert ? 110 : 90 + (orange.faceY || 0),
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={avert ? -5 : undefined} forceLookY={avert ? 5 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={avert ? -5 : undefined} forceLookY={avert ? 5 : undefined} />
              </div>
            </div>

            {/* 黄色高个 — 前右 */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 310,
                width: 140,
                height: 230,
                backgroundColor: "#E8D754",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform: avert ? "skewX(0deg)" : `skewX(${yellow.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: avert ? 20 : 52 + (yellow.faceX || 0),
                  top: avert ? 60 : 40 + (yellow.faceY || 0),
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={avert ? -5 : undefined} forceLookY={avert ? 5 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={avert ? -5 : undefined} forceLookY={avert ? 5 : undefined} />
              </div>
              <div
                className="absolute h-[4px] w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
                style={{ left: 40 + (yellow.faceX || 0), top: 88 + (yellow.faceY || 0) }}
              />
            </div>
          </div>
        </div>

        {/* 氛围光斑 */}
        <div className="pointer-events-none absolute right-[20%] top-[20%] size-64 rounded-full bg-[#6C3FF5]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[15%] left-[15%] size-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* 右：登录表单（沿用你的 SignInBlock，真实鉴权不变） */}
      <div
        className="flex items-center justify-center p-8"
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
      >
        <div className="w-full max-w-sm">
          <SignInBlock />
        </div>
      </div>
    </div>
  );
}
