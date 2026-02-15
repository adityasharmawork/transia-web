"use client";

import { AnimatedSection } from "./shared/animated-section";

const innerLangs = ["es", "fr", "de", "ja"];
const middleLangs = ["ko", "zh", "pt", "ar"];
const outerLangs = ["hi", "it", "nl", "ru"];

function OrbitRing({
  radius,
  languages,
  animationClass,
  duration,
}: {
  radius: number;
  languages: string[];
  animationClass: string;
  duration: string;
}) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className={`absolute top-1/2 left-1/2 ${reducedMotion ? "" : animationClass}`}
      style={{
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
      }}
    >
      {/* Ring border */}
      <div
        className="absolute inset-0 rounded-full border border-[var(--border)]"
        style={{ opacity: 0.5 }}
      />
      {/* Language nodes */}
      {languages.map((lang, i) => {
        const angle = (i / languages.length) * 360;
        return (
          <div
            key={lang}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
              marginLeft: -16,
              marginTop: -12,
            }}
          >
            <div
              className={`${reducedMotion ? "" : animationClass}`}
              style={{
                animationDirection: "reverse",
                animationDuration: duration,
              }}
            >
              <span className="inline-flex h-6 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                {lang}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LanguageOrbit() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center py-24">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection className="flex flex-col items-center">
          {/* Orbit visualization */}
          <div className="relative h-[320px] w-[320px] md:h-[480px] md:w-[480px]">
            {/* Center - source locale */}
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-glow-pulse flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-hover)] bg-[var(--surface)]">
                <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                  en
                </span>
              </div>
            </div>

            {/* Orbits - responsive radii */}
            <div className="hidden md:block">
              <OrbitRing
                radius={100}
                languages={innerLangs}
                animationClass="animate-orbit-inner"
                duration="60s"
              />
              <OrbitRing
                radius={170}
                languages={middleLangs}
                animationClass="animate-orbit-middle"
                duration="90s"
              />
              <OrbitRing
                radius={240}
                languages={outerLangs}
                animationClass="animate-orbit-outer"
                duration="120s"
              />
            </div>

            {/* Mobile: smaller radii, 2 rings */}
            <div className="md:hidden">
              <OrbitRing
                radius={80}
                languages={innerLangs}
                animationClass="animate-orbit-inner"
                duration="60s"
              />
              <OrbitRing
                radius={140}
                languages={[...middleLangs, ...outerLangs.slice(0, 2)]}
                animationClass="animate-orbit-middle"
                duration="90s"
              />
            </div>
          </div>

          <h3 className="mt-12 text-center text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
            One source.{" "}
            <span className="text-[var(--text-secondary)]">Every language.</span>
          </h3>
        </AnimatedSection>
      </div>
    </section>
  );
}
