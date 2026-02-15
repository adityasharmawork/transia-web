"use client";

import { useEffect, useRef } from "react";

interface Pulse {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  life: number;
  maxLife: number;
  opacity: number;
}

const GRID_SIZE = 60;
const PULSE_COUNT = 16;
const PULSE_COUNT_MOBILE = 8;
const TRAIL_LENGTH = 40;

export function CircuitPulseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let pulses: Pulse[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isMobile = false;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function getPulseColor() {
      const isDark = document.documentElement.classList.contains("dark");
      return isDark
        ? "rgba(255, 255, 255, ALPHA)"
        : "rgba(0, 0, 0, ALPHA)";
    }

    function getGridColor() {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue("--grid-line").trim();
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768;

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createPulse(): Pulse {
      const horizontal = Math.random() > 0.5;
      const gridCols = Math.floor(width / GRID_SIZE);
      const gridRows = Math.floor(height / GRID_SIZE);

      let x: number, y: number, dx: number, dy: number;

      if (horizontal) {
        y = Math.floor(Math.random() * gridRows) * GRID_SIZE;
        x = Math.random() > 0.5 ? -TRAIL_LENGTH : width + TRAIL_LENGTH;
        dx = x < 0 ? 1 : -1;
        dy = 0;
      } else {
        x = Math.floor(Math.random() * gridCols) * GRID_SIZE;
        y = Math.random() > 0.5 ? -TRAIL_LENGTH : height + TRAIL_LENGTH;
        dx = 0;
        dy = y < 0 ? 1 : -1;
      }

      const speed = 40 + Math.random() * 60;
      const maxLife = ((Math.max(width, height) + TRAIL_LENGTH * 2) / speed) * 1.2;
      const opacity = 0.04 + Math.random() * 0.06;

      return { x, y, dx, dy, speed, life: 0, maxLife, opacity };
    }

    function initPulses() {
      const count = isMobile ? PULSE_COUNT_MOBILE : PULSE_COUNT;
      pulses = [];
      for (let i = 0; i < count; i++) {
        const pulse = createPulse();
        pulse.life = Math.random() * pulse.maxLife;
        pulses.push(pulse);
      }
    }

    function drawGrid(gridColor: string) {
      ctx!.strokeStyle = gridColor;
      ctx!.lineWidth = 1;

      ctx!.beginPath();
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
      }
      ctx!.stroke();
    }

    function drawPulses(dt: number) {
      const colorTemplate = getPulseColor();

      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.x += p.dx * p.speed * dt;
        p.y += p.dy * p.speed * dt;
        p.life += dt;

        if (
          p.life > p.maxLife ||
          p.x < -TRAIL_LENGTH * 2 ||
          p.x > width + TRAIL_LENGTH * 2 ||
          p.y < -TRAIL_LENGTH * 2 ||
          p.y > height + TRAIL_LENGTH * 2
        ) {
          pulses[i] = createPulse();
          continue;
        }

        const trailEndX = p.x - p.dx * TRAIL_LENGTH;
        const trailEndY = p.y - p.dy * TRAIL_LENGTH;

        const headColor = colorTemplate.replace("ALPHA", String(p.opacity));
        const tailColor = colorTemplate.replace("ALPHA", "0");

        const gradient = ctx!.createLinearGradient(
          trailEndX,
          trailEndY,
          p.x,
          p.y
        );
        gradient.addColorStop(0, tailColor);
        gradient.addColorStop(1, headColor);

        // Trail line
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(trailEndX, trailEndY);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();

        // Head dot
        const dotColor = colorTemplate.replace("ALPHA", String(p.opacity * 1.8));
        ctx!.fillStyle = dotColor;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    let lastTime = 0;

    function animate(time: number) {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx!.clearRect(0, 0, width, height);

      const gridColor = getGridColor();
      drawGrid(gridColor);

      if (!reducedMotion) {
        drawPulses(dt);
      }

      animationId = requestAnimationFrame(animate);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        lastTime = performance.now();
        animationId = requestAnimationFrame(animate);
      }
    }

    resize();
    initPulses();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      initPulses();
    });
    resizeObserver.observe(document.documentElement);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    lastTime = performance.now();
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
