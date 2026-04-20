"use client";
import { useRef, useEffect } from "react";

const N = 90;
const TEAL = "79,196,160";
const MAX_DIST = 120;

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, raf = 0;
    const ps: P[] = [];

    function init() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      ps.length = 0;
      for (let i = 0; i < N; i++) {
        ps.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.0 + 0.35,
          a: Math.random() * 0.28 + 0.07,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      for (const p of ps) {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        // Hero zone: top 60% of viewport gets a brightness boost
        const boost = p.y < H * 0.6 ? 2.2 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${TEAL},${Math.min(p.a * boost, 0.6)})`;
        ctx.fill();
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const midY = (ps[i].y + ps[j].y) / 2;
            const boost = midY < H * 0.6 ? 1.8 : 1;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(${TEAL},${(1 - d / MAX_DIST) * 0.048 * boost})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    init();
    tick();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
