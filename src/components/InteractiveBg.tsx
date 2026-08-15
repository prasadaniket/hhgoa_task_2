"use client";

import { useEffect, useRef } from "react";

export function InteractiveBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const SPACING = 40;
    const PULL_RADIUS = 200;
    const PULL_STRENGTH = 0.5;

    const mouse = { x: -9999, y: -9999 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onResize = () => {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / SPACING) + 2;
      const rows = Math.ceil(H / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Base grid position
          const bx = c * SPACING;
          const by = r * SPACING;

          // Magnetic warp toward cursor
          const dx = mouse.x - bx;
          const dy = mouse.y - by;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let nx = bx;
          let ny = by;

          if (dist < PULL_RADIUS && dist > 0) {
            const force = (1 - dist / PULL_RADIUS) * PULL_STRENGTH;
            nx += dx * force;
            ny += dy * force;
          }

          // Dot opacity based on distance from cursor
          const proximity = Math.max(0, 1 - dist / 360);
          const alpha = 0.12 + proximity * 0.35;

          ctx.beginPath();
          ctx.arc(nx, ny, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ background: "#090a0c" }}
    />
  );
}
