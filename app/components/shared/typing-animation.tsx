"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "motion/react";

interface TerminalLine {
  text: string;
  color?: "green" | "cyan" | "yellow" | "red" | "dim" | "white";
  delay?: number;
  instant?: boolean;
}

export function TypingAnimation({
  lines,
  typingSpeed = 30,
  lineDelay = 100,
  startDelay = 0,
  className,
}: {
  lines: TerminalLine[];
  typingSpeed?: number;
  lineDelay?: number;
  startDelay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isInView || started) return;
    const timeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timeout);
  }, [isInView, startDelay, started]);

  useEffect(() => {
    if (!started || complete) return;
    if (currentLineIndex >= lines.length) {
      setComplete(true);
      return;
    }

    const line = lines[currentLineIndex];

    if (line.instant) {
      setDisplayedLines((prev) => [...prev, line.text]);
      const nextDelay = line.delay ?? lineDelay;
      const timeout = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, nextDelay);
      return () => clearTimeout(timeout);
    }

    if (currentCharIndex < line.text.length) {
      const jitter = Math.random() * 20 - 10;
      const timeout = setTimeout(() => {
        setCurrentCharIndex((c) => c + 1);
      }, typingSpeed + jitter);
      return () => clearTimeout(timeout);
    }

    const nextDelay = line.delay ?? lineDelay;
    const timeout = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, line.text]);
      setCurrentLineIndex((i) => i + 1);
      setCurrentCharIndex(0);
    }, nextDelay);
    return () => clearTimeout(timeout);
  }, [started, complete, currentLineIndex, currentCharIndex, lines, typingSpeed, lineDelay]);

  const colorClass = (color?: TerminalLine["color"]) => {
    switch (color) {
      case "green":
        return "text-[var(--terminal-green)]";
      case "cyan":
        return "text-[var(--terminal-cyan)]";
      case "yellow":
        return "text-[var(--terminal-yellow)]";
      case "red":
        return "text-[var(--terminal-red)]";
      case "dim":
        return "text-white/40";
      default:
        return "text-white/80";
    }
  };

  return (
    <div ref={ref} className={`whitespace-pre ${className ?? ""}`}>
      {displayedLines.map((text, i) => (
        <div key={i} className={colorClass(lines[i]?.color)}>
          {text}
        </div>
      ))}
      {started && !complete && currentLineIndex < lines.length && (
        <div className={colorClass(lines[currentLineIndex]?.color)}>
          {lines[currentLineIndex].instant
            ? lines[currentLineIndex].text
            : lines[currentLineIndex].text.slice(0, currentCharIndex)}
          <span className="animate-cursor-blink text-white/60">|</span>
        </div>
      )}
      {complete && (
        <div className="text-white/40">
          <span className="animate-cursor-blink">|</span>
        </div>
      )}
    </div>
  );
}
