"use client";

import { useEffect, useRef, useState } from "react";

// London neighbourhoods with approximate canvas positions and scores
// Based on thesis data approximation (central London café viability)
const SPOTS = [
  { x: 0.52, y: 0.42, score: 0.91, label: "Soho", delay: 0 },
  { x: 0.48, y: 0.38, score: 0.87, label: "Fitzrovia", delay: 0.4 },
  { x: 0.55, y: 0.45, score: 0.83, label: "Covent Garden", delay: 0.8 },
  { x: 0.44, y: 0.44, score: 0.79, label: "Bloomsbury", delay: 1.1 },
  { x: 0.58, y: 0.52, score: 0.75, label: "Southwark", delay: 0.2 },
  { x: 0.42, y: 0.55, score: 0.71, label: "Lambeth", delay: 1.5 },
  { x: 0.35, y: 0.38, score: 0.68, label: "Paddington", delay: 0.6 },
  { x: 0.62, y: 0.39, score: 0.65, label: "Shoreditch", delay: 1.9 },
  { x: 0.38, y: 0.6, score: 0.62, label: "Clapham", delay: 0.9 },
  { x: 0.68, y: 0.55, score: 0.59, label: "Bermondsey", delay: 1.3 },
  { x: 0.28, y: 0.48, score: 0.54, label: "Chiswick", delay: 2.1 },
  { x: 0.72, y: 0.44, score: 0.51, label: "Hackney", delay: 1.7 },
];

export function HeatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    score: number;
  } | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const t = (Date.now() - startTimeRef.current) / 1000;

      ctx.clearRect(0, 0, w, h);

      SPOTS.forEach((spot) => {
        const cx = spot.x * w;
        const cy = spot.y * h;

        // Pulse: each spot has its own phase
        const phase = (t + spot.delay) % 3;
        const pulse = phase < 1.5 ? phase / 1.5 : (3 - phase) / 1.5;
        const radius = 6 + spot.score * 14;
        const outerRadius = radius + pulse * radius * 0.5;
        const alpha = 0.85 - pulse * 0.45;

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 160, 32, ${alpha * 0.3})`;
        ctx.fill();

        // Core circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 160, 32, ${0.6 + spot.score * 0.3})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const hit = SPOTS.find((spot) => {
      const dx = mx - spot.x;
      const dy = my - spot.y;
      return Math.sqrt(dx * dx + dy * dy) < 0.04;
    });

    if (hit) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label: hit.label,
        score: hit.score,
      });
    } else {
      setTooltip(null);
    }
  }

  return (
    <div className="relative bg-dark" style={{ height: "280px" }}>
      {/* Label */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-map-heat animate-pulse block" />
        <span className="font-mono text-[11px] text-muted/70 tracking-wide">
          Thesis · Café location intelligence · London
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none font-mono text-[11px] bg-dark-surface border border-faint/20 px-3 py-1.5 text-white z-20"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 16,
          }}
        >
          {tooltip.label} · {Math.round(tooltip.score * 100)}% success probability
        </div>
      )}

      {/* Caption */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-6">
        <span className="font-mono text-[10px] text-muted/50">
          hover the heat spots · spatial ML · GeoPandas · Folium · AHP
        </span>
        <span className="font-mono text-[10px] text-muted/50">
          low ○ ○ ● ● ● high success probability
        </span>
      </div>
    </div>
  );
}
