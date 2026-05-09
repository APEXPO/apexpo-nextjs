"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = (
  "∞APEXPO{}[]<>()=+-*/|\\01アイウエオカキクケ" +
  "MATCHDEALAISELLBUYTRADECONNECTGROW" +
  "0110100111010FUNCTION_RETURN_IF_ELSE" +
  "∞∞∞...:::;;;___---ASYNC_AWAIT_FETCH" +
  "NODE_API_JSON_DATA_FLOW_SYNC_LIVE"
).split("");

const FONT_SIZE = 14;
const REDRAW_MS = 30;

type CodeRainProps = {
  opacity?: number;
};

/**
 * Matrix-style falling code — same implementation as apexpo-v5/src/components/CodeRain.jsx
 * (theme via prefers-color-scheme; defaults to dark palette when unset).
 */
export default function CodeRain({ opacity = 0.7 }: CodeRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setIsDark(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drops: number[] = [];
    let speeds: number[] = [];
    let bright: boolean[] = [];
    let running = true;
    let lastDraw = 0;
    let rafId = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth ?? window.innerWidth;
      canvas.height = parent?.clientHeight ?? window.innerHeight;
    };

    const init = () => {
      resize();
      const cols = Math.floor(canvas.width / FONT_SIZE) + 2;
      drops = Array.from({ length: cols }, () => Math.random() * -100);
      speeds = Array.from({ length: cols }, () => 0.4 + Math.random() * 1.2);
      bright = Array.from({ length: cols }, () => Math.random() > 0.85);
    };

    const draw = (ts: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(draw);
      if (ts - lastDraw < REDRAW_MS) return;
      lastDraw = ts;

      ctx.fillStyle = isDark
        ? "rgba(2, 6, 23, 0.035)"
        : "rgba(245, 240, 232, 0.055)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", ui-monospace, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]!;
        const isBright = bright[i] && Math.random() > 0.7;
        const isAccent = Math.random() > 0.93;

        if (isAccent) {
          ctx.fillStyle = isDark
            ? "rgba(192, 132, 252, 1)"
            : "rgba(124, 58, 237, 0.9)";
        } else if (isBright) {
          ctx.fillStyle = isDark
            ? "rgba(103, 232, 249, 1)"
            : "rgba(14, 116, 144, 1)";
        } else {
          const depth = Math.random();
          if (depth > 0.7) {
            ctx.fillStyle = isDark
              ? "rgba(34, 211, 238, 0.85)"
              : "rgba(14, 116, 144, 0.7)";
          } else if (depth > 0.4) {
            ctx.fillStyle = isDark
              ? "rgba(34, 211, 238, 0.55)"
              : "rgba(14, 116, 144, 0.5)";
          } else {
            ctx.fillStyle = isDark
              ? "rgba(34, 211, 238, 0.32)"
              : "rgba(14, 116, 144, 0.32)";
          }
        }

        ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
        drops[i] += speeds[i];

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.97) {
          drops[i] = Math.random() * -40;
          bright[i] = Math.random() > 0.8;
          speeds[i] = 0.4 + Math.random() * 1.2;
        }
      }
    };

    init();
    rafId = requestAnimationFrame(draw);

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          running = e.isIntersecting;
          if (running) rafId = requestAnimationFrame(draw);
        });
      },
      { threshold: 0 },
    );
    if (canvas.parentElement) io.observe(canvas.parentElement);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    />
  );
}
