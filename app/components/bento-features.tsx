"use client";

import { Badge } from "./shared/badge";
import { GlowCard } from "./shared/glow-card";
import {
  StaggerContainer,
  StaggerItem,
} from "./shared/stagger-container";

export function BentoFeatures() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16">
          <Badge>Your Competitive Edge</Badge>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
            Built for teams that
            <br />
            <span className="text-[var(--text-secondary)]">ship worldwide.</span>
          </h2>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* BYOK - Wide card */}
          <StaggerItem className="lg:col-span-2">
            <GlowCard className="h-full">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-2">
                    <KeyIcon />
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                      BYOK
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Zero vendor lock-in.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Your API keys stay in your .env files. Never stored, never
                    transmitted to third parties. Switch providers anytime without
                    changing a single line of code.
                  </p>
                </div>
                <div className="force-dark flex-shrink-0 rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-4 font-mono text-xs">
                  <div className="text-[var(--gray-500)]"># .env.local</div>
                  <div className="mt-1 text-[var(--terminal-green)]">
                    OPENAI_API_KEY=<span className="text-[var(--gray-600)]">sk-••••••••</span>
                  </div>
                  <div className="text-[var(--terminal-green)]">
                    ANTHROPIC_API_KEY=<span className="text-[var(--gray-600)]">sk-ant-••••</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* 4 Providers */}
          <StaggerItem>
            <GlowCard className="h-full">
              <div className="mb-3 flex items-center gap-2">
                <GridIcon />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                  Providers
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Best-in-class AI, your choice.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Switch providers with a single config change. Always use the best model for your needs.
              </p>
              <div className="mt-6 space-y-2 font-mono text-sm">
                {["OpenAI", "Anthropic", "Gemini", "Grok"].map(
                  (provider, i) => (
                    <div
                      key={provider}
                      className={`rounded-md border px-3 py-1.5 transition-colors ${
                        i === 0
                          ? "border-[var(--border-hover)] text-[var(--foreground)]"
                          : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {provider}
                    </div>
                  )
                )}
              </div>
            </GlowCard>
          </StaggerItem>

          {/* AST Parsing */}
          <StaggerItem>
            <GlowCard className="h-full">
              <div className="mb-3 flex items-center gap-2">
                <TreeIcon />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                  AST
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Ship today. Not next quarter.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Babel-powered AST parsing extracts strings directly from your existing
                JSX. No wrappers, no migration — just run and go.
              </p>
              <div className="force-dark mt-6 rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-4 font-mono text-xs">
                <div className="text-[var(--gray-500)]">{"// Your code"}</div>
                <div>
                  <span className="text-[var(--terminal-cyan)]">{"<h1>"}</span>
                  <span className="text-white">Welcome back</span>
                  <span className="text-[var(--terminal-cyan)]">{"</h1>"}</span>
                </div>
                <div className="mt-1 text-[var(--gray-600)]">{"// ↓ Auto-extracted"}</div>
                <div className="text-[var(--terminal-green)]">
                  {'"welcome_back_a1b2"'}
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* Delta Translation */}
          <StaggerItem>
            <GlowCard className="h-full">
              <div className="mb-3 flex items-center gap-2">
                <FingerprintIcon />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                  SHA-256
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Scale without scaling costs.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                SHA-256 fingerprinting tracks every string. Changed 2 strings
                out of 800? You pay for 2. Your costs stay flat as your product grows.
              </p>
              <div className="mt-6 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">847 total</span>
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                  <span className="text-[var(--terminal-green)]">12 new</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">835 cached</span>
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                  <span className="text-[var(--text-tertiary)]">$0.00</span>
                </div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* Security */}
          <StaggerItem>
            <GlowCard className="h-full">
              <div className="mb-3 flex items-center gap-2">
                <ShieldIcon />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                  Security
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Enterprise trust, built in.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Secrets auto-redacted from AI prompts. Atomic writes prevent
                corruption. Auth errors abort immediately. Your data never leaves your control.
              </p>
              <div className="mt-6 space-y-1 font-mono text-xs text-[var(--text-muted)]">
                <div>[OPENAI_KEY] &rarr; [REDACTED]</div>
                <div>[JWT_TOKEN] &rarr; [REDACTED]</div>
                <div>[AWS_SECRET] &rarr; [REDACTED]</div>
              </div>
            </GlowCard>
          </StaggerItem>

          {/* Output Formats - Full width */}
          <StaggerItem className="md:col-span-2 lg:col-span-3">
            <GlowCard>
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Deploy-ready from the first run.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Generates files compatible with next-intl and i18next out of
                  the box. No migration, no glue code — commit and deploy.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="force-dark rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-4">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
                    next-intl &middot; locales/es.json
                  </div>
                  <pre className="font-mono text-xs leading-relaxed text-[var(--gray-300)]">
{`{
  "welcome_back_a1b2": "Bienvenido",
  "save_changes_c3d4": "Guardar cambios",
  "log_out_e5f6": "Cerrar sesi\u00f3n"
}`}
                  </pre>
                </div>
                <div className="force-dark rounded-lg border border-white/[0.06] bg-[#0d0d0d] p-4">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
                    i18next &middot; locales/es/translation.json
                  </div>
                  <pre className="font-mono text-xs leading-relaxed text-[var(--gray-300)]">
{`{
  "dashboard": {
    "welcome_back": "Bienvenido",
    "save_changes": "Guardar cambios"
  },
  "auth": {
    "log_out": "Cerrar sesi\u00f3n"
  }
}`}
                  </pre>
                </div>
              </div>
            </GlowCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function KeyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-[var(--text-secondary)]"
    >
      <path
        d="M10 1a4 4 0 0 0-3.87 5.03L2 10.17V14h3.83l.17-.17V12h2v-2h2l.93-.93A4 4 0 0 0 10 1zm1 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
        fill="currentColor"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-[var(--text-secondary)]"
    >
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-[var(--text-secondary)]"
    >
      <path
        d="M8 1v6M8 7l-4 4M8 7l4 4M4 11v4M12 11v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FingerprintIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-[var(--text-secondary)]"
    >
      <path
        d="M8 1C4.69 1 2 3.69 2 7v2c0 3.31 2.69 6 6 6s6-2.69 6-6V7c0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4v2c0 2.21-1.79 4-4 4s-4-1.79-4-4V7c0-2.21 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-[var(--text-secondary)]"
    >
      <path
        d="M8 1L2 4v4c0 3.53 2.56 6.83 6 7.53 3.44-.7 6-4 6-7.53V4L8 1z"
        fill="currentColor"
      />
    </svg>
  );
}
