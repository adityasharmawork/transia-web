"use client";

import { useState } from "react";
import { DocsSection } from "./docs-section";
import { DocsCodeBlock } from "./docs-code-block";
import { DocsTable } from "./docs-table";
import { DocsCallout } from "./docs-callout";

/* ---------- ITSAW Banner ---------- */

const ITSAW_STEPS = [
  { letter: "I", name: "Init", id: "init", desc: "Configure project" },
  { letter: "T", name: "Translate", id: "translate", desc: "Extract strings" },
  { letter: "S", name: "Setup", id: "setup", desc: "Wire up your app" },
  { letter: "A", name: "Apply", id: "apply", desc: "Use t() in code" },
  { letter: "W", name: "Widget", id: "widget", desc: "Add switcher" },
];

function ItsawBanner() {
  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto">
      {ITSAW_STEPS.map((step, i) => (
        <div key={step.letter} className="flex flex-shrink-0 items-center gap-1">
          <a
            href={`#${step.id}`}
            className="group flex w-[100px] flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-3 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--glow)] sm:w-[110px] sm:px-3"
          >
            <span className="font-mono text-xl font-bold text-[var(--terminal-cyan)] transition-transform group-hover:scale-110 sm:text-2xl">
              {step.letter}
            </span>
            <span className="mt-1 font-mono text-[11px] font-medium text-[var(--foreground)]">
              {step.name}
            </span>
            <span className="mt-0.5 text-center text-[9px] leading-tight text-[var(--text-muted)] sm:text-[10px]">
              {step.desc}
            </span>
          </a>
          {i < ITSAW_STEPS.length - 1 && (
            <span className="text-sm text-[var(--text-muted)]">{"\u2192"}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- FAQ Item ---------- */

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--text-secondary)]"
      >
        {question}
        <span
          className={`ml-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {answer}
        </p>
      )}
    </div>
  );
}

/* ---------- Main Content ---------- */

export function DocsContent() {
  return (
    <div>
      {/* ================================================================
          GETTING STARTED
          ================================================================ */}

      {/* ---- Quick Start (Method 1) ---- */}
      <DocsSection
        id="quick-start"
        title="Quick Start"
        subtitle="The recommended way to use Transia. Install it and run one command."
      >
        <div className="mb-2 inline-block rounded-full border border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 px-3 py-1 font-mono text-[11px] font-medium text-[var(--terminal-green)]">
          Method 1 — Recommended
        </div>
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-mono text-xs font-medium text-[var(--terminal-cyan)]">
              Step 1 — Install
            </p>
            <DocsCodeBlock code="npm install -g transia" filename="Terminal" />
          </div>
          <div>
            <p className="mb-2 font-mono text-xs font-medium text-[var(--terminal-cyan)]">
              Step 2 — Run
            </p>
            <DocsCodeBlock
              code={`cd your-project\ntransia`}
              filename="Terminal"
            />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            That&apos;s it. The smart workflow will guide you through login,
            project setup, translation, i18n configuration, and adding the
            language switcher widget — all automatically. You don&apos;t need
            to remember any other commands.
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Want more control?{" "}
            <a href="#itsaw" className="text-[var(--terminal-cyan)] underline">
              See the ITSAW flow below
            </a>{" "}
            for the advanced 5-step approach.
          </p>
        </div>
      </DocsSection>

      {/* ---- Installation ---- */}
      <DocsSection id="installation" title="Installation" subtitle="Installation options and requirements.">
        <DocsCodeBlock
          code={`# Global install (recommended)\nnpm install -g transia\n\n# Or use npx (no install needed)\nnpx transia\n\n# Or with other package managers\nyarn global add transia\npnpm add -g transia`}
          filename="Terminal"
        />
        <p className="text-sm text-[var(--text-secondary)]">
          <strong>Requirements:</strong> Node.js 20 or later. Works with npm,
          yarn, and pnpm.
        </p>
      </DocsSection>

      {/* ---- Authentication ---- */}
      <DocsSection id="authentication" title="Authentication" subtitle="Log in to connect your CLI to the Transia dashboard.">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          transia login
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Opens your browser for secure OAuth authentication. Once confirmed,
          an encrypted token is saved locally at{" "}
          <code className="font-mono text-[var(--foreground)]">~/.transia/credentials.json</code>.
        </p>
        <DocsCodeBlock
          code={`$ transia login\n\n  Open this URL in your browser to log in:\n  https://transia.dev/auth/cli?session=...\n\n\u2714 Logged in as you@example.com`}
          filename="Terminal"
        />
        <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
          transia logout
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Securely removes stored credentials from your machine.
        </p>
        <DocsCodeBlock code="transia logout" filename="Terminal" />
        <DocsCallout type="info">
          Authentication is required for all Transia commands. The smart{" "}
          <code className="font-mono text-[var(--foreground)]">transia</code>{" "}
          command will prompt you to log in automatically if needed.
        </DocsCallout>
      </DocsSection>

      {/* ================================================================
          ADVANCED: THE ITSAW FLOW
          ================================================================ */}

      {/* ---- ITSAW Overview ---- */}
      <DocsSection
        id="itsaw"
        title="The ITSAW Flow"
        subtitle="Method 2: Advanced — run each step manually for full control."
      >
        <div className="mb-2 inline-block rounded-full border border-[var(--terminal-cyan)]/30 bg-[var(--terminal-cyan)]/5 px-3 py-1 font-mono text-[11px] font-medium text-[var(--terminal-cyan)]">
          Method 2 — Advanced
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          <strong>ITSAW</strong> — five steps to go global. Each command gives
          you granular control over the localization process. Click any step to
          jump to its documentation.
        </p>
        <ItsawBanner />
        <DocsCallout type="tip">
          You only need the ITSAW flow if you want manual control over each
          step. For most users, the smart{" "}
          <code className="font-mono text-[var(--foreground)]">transia</code>{" "}
          command in Quick Start handles all of this automatically.
        </DocsCallout>
      </DocsSection>

      {/* ---- I — Init ---- */}
      <DocsSection id="init" title="I — Init" subtitle="Configure your project for Transia.">
        <DocsCodeBlock code="transia init" filename="Terminal" />
        <p className="text-sm text-[var(--text-secondary)]">
          Auto-detects your framework (Next.js, React, Remix, Gatsby) and source
          directories, then walks you through an interactive setup:
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
          <li>Choose your i18n format (next-intl or i18next)</li>
          <li>Select target locales (e.g. es, fr, de)</li>
          <li>Pick your AI translation provider or use auto-detect</li>
          <li>Register the project on your Transia dashboard</li>
        </ul>
        <p className="text-sm text-[var(--text-secondary)]">
          Creates a <code className="font-mono text-[var(--foreground)]">transia.config.json</code> in your project root:
        </p>
        <DocsCodeBlock
          filename="transia.config.json"
          code={`{
  "version": 1,
  "sourceLocale": "en",
  "targetLocales": ["es", "fr", "de"],
  "provider": { "name": "auto" },
  "include": ["app/**/*.{tsx,jsx}"],
  "exclude": ["**/*.test.*", "**/*.spec.*", "**/node_modules/**"],
  "output": { "format": "next-intl", "path": "locales" },
  "projectId": "...",
  "publicKey": "trn_pub_..."
}`}
        />
        <DocsCallout type="tip">
          Use <code className="font-mono text-[var(--foreground)]">transia init --yes</code> to skip
          interactive prompts and accept defaults. Useful for CI/CD pipelines.
        </DocsCallout>
      </DocsSection>

      {/* ---- T — Translate ---- */}
      <DocsSection id="translate" title="T — Translate" subtitle="Extract and translate strings from your source files.">
        <DocsCodeBlock code="transia translate" filename="Terminal" />
        <p className="text-sm text-[var(--text-secondary)]">
          Scans your JSX/TSX files, extracts translatable strings, and sends
          them to your configured AI provider. Translations are saved as locale
          files in your output directory.
        </p>
        <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
          How it works
        </h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--text-secondary)]">
          <li>Parses JSX/TSX via Babel AST to extract text, attributes, and template literals</li>
          <li>SHA-256 fingerprints each string for delta detection (only new/changed strings are translated)</li>
          <li>Batches strings (50/batch) and translates with 3-locale concurrency</li>
          <li>Validates translations (preserves placeholders, blocks XSS)</li>
          <li>Generates locale files atomically with backup</li>
        </ol>
        <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
          Flags
        </h3>
        <DocsTable
          headers={["Flag", "Description", "Default"]}
          rows={[
            ["--target <locales>", "Comma-separated locale codes to translate", "From config"],
            ["--provider <name>", "Override the AI provider", "From config"],
            ["--force", "Re-translate all strings, ignoring cache", "false"],
            ["--dry-run", "Preview what would be translated without calling AI", "false"],
            ["--verbose", "Show detailed debug output", "false"],
          ]}
        />
        <DocsCodeBlock
          code={`# Translate to specific locales\ntransia translate --target es,fr\n\n# Force re-translate everything\ntransia translate --force\n\n# Preview without translating\ntransia translate --dry-run`}
          filename="Terminal"
        />
      </DocsSection>

      {/* ---- S — Setup ---- */}
      <DocsSection id="setup" title="S — Setup" subtitle="Wire up your app to use the translated strings.">
        <DocsCodeBlock code="transia setup" filename="Terminal" />
        <p className="text-sm text-[var(--text-secondary)]">
          Configures your project so it can load and display translations.
          Installs the required dependencies, creates config files, and sets up
          routing and middleware automatically based on your framework.
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
          <li><strong>Next.js:</strong> Creates routing, request config, middleware, and updates your Next config</li>
          <li><strong>React:</strong> Creates the translation config and injects imports into your entry point</li>
        </ul>
        <DocsCodeBlock
          code={`$ transia setup\n\n\u2714 Installed next-intl\n\u2714 Created i18n/request.ts\n\u2714 Created i18n/routing.ts\n\u2714 Created middleware.ts\n\u2714 Updated next.config.ts`}
          filename="Terminal"
        />
      </DocsSection>

      {/* ---- A — Apply ---- */}
      <DocsSection id="apply" title="A — Apply" subtitle="Rewrite source files to use translation function calls.">
        <DocsCodeBlock code="transia apply" filename="Terminal" />
        <p className="text-sm text-[var(--text-secondary)]">
          Rewrites your source files to replace hardcoded strings with{" "}
          <code className="font-mono text-[var(--foreground)]">t()</code> calls
          and automatically injects the necessary i18n imports.
        </p>
        <DocsCodeBlock
          filename="Before"
          code={`export function Hero() {\n  return <h1>Welcome to our platform</h1>;\n}`}
        />
        <DocsCodeBlock
          filename="After (next-intl)"
          code={`import { useTranslations } from "next-intl";\n\nexport function Hero() {\n  const t = useTranslations();\n  return <h1>{t("welcome_to_our_platform_a1b2c3")}</h1>;\n}`}
        />
        <DocsCallout type="warning" title="Commit first">
          Always commit your code before running{" "}
          <code className="font-mono">transia apply</code>. It modifies source
          files in place.
        </DocsCallout>
      </DocsSection>

      {/* ---- W — Widget ---- */}
      <DocsSection id="widget" title="W — Widget" subtitle="Add a floating language switcher to your app.">
        <DocsCodeBlock code="transia widget" filename="Terminal" />
        <p className="text-sm text-[var(--text-secondary)]">
          Installs the{" "}
          <code className="font-mono text-[var(--foreground)]">@transia/widget</code>{" "}
          package, generates a{" "}
          <code className="font-mono text-[var(--foreground)]">TransiaLanguageSwitcher.tsx</code>{" "}
          wrapper component, and auto-injects it into your layout. The floating
          widget appears at the bottom-right corner of your app.
        </p>

        <h3 className="mt-8 text-lg font-semibold text-[var(--foreground)]">
          @transia/widget Props
        </h3>
        <DocsTable
          headers={["Prop", "Type", "Default", "Description"]}
          rows={[
            ["locales", "string[]", "required", "Available locale codes"],
            ["currentLocale", "string?", "auto", "Currently active locale"],
            ["onLocaleChange", "(locale: string) => void", "required", "Callback when language changes"],
            ["position", '"bottom-right" | "bottom-left" | "top-right" | "top-left"', '"bottom-right"', "Widget position"],
            ["theme", '"auto" | "light" | "dark"', '"auto"', "Color scheme"],
            ["showFlags", "boolean", "true", "Show flag emoji icons"],
            ["showBranding", "boolean", "true", "Show Powered by Transia footer"],
            ["projectId", "string?", "\u2014", "Public key for analytics tracking"],
          ]}
        />

        <h3 className="mt-8 text-lg font-semibold text-[var(--foreground)]">
          Framework Integration
        </h3>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          For next-intl projects:
        </p>
        <DocsCodeBlock
          filename="components/TransiaLanguageSwitcher.tsx"
          code={`"use client";
import { TransiaWidget } from "@transia/widget";
import { createNextIntlProps } from "@transia/widget/next-intl";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export function TransiaLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const widgetProps = createNextIntlProps({
    locales: ["en", "es", "fr"],
    currentLocale: locale,
    onLocaleChange: (newLocale) => {
      router.replace(pathname, { locale: newLocale });
    },
  });

  return <TransiaWidget {...widgetProps} projectId="trn_pub_..." showBranding />;
}`}
        />
        <p className="mb-3 mt-6 text-sm text-[var(--text-secondary)]">
          For i18next projects:
        </p>
        <DocsCodeBlock
          filename="components/TransiaLanguageSwitcher.tsx"
          code={`import { TransiaWidget } from "@transia/widget";
import { createI18nextProps } from "@transia/widget/i18next";
import { useTranslation } from "react-i18next";

export function TransiaLanguageSwitcher() {
  const { i18n } = useTranslation();

  const widgetProps = createI18nextProps({
    locales: ["en", "es", "fr"],
    currentLanguage: i18n.language,
    changeLanguage: (lng) => i18n.changeLanguage(lng),
  });

  return <TransiaWidget {...widgetProps} projectId="trn_pub_..." showBranding />;
}`}
        />
      </DocsSection>

      {/* ================================================================
          REFERENCE
          ================================================================ */}

      {/* ---- Configuration ---- */}
      <DocsSection id="configuration" title="Configuration Reference" subtitle="All fields in transia.config.json explained.">
        <DocsTable
          headers={["Field", "Type", "Default", "Description"]}
          rows={[
            ["version", "number", "1", "Config schema version"],
            ["sourceLocale", "string", '"en"', "Source language code"],
            ["targetLocales", "string[]", '["es"]', "Languages to translate to"],
            ["provider.name", "string", '"auto"', "AI provider: auto, openai, anthropic, gemini, grok, managed"],
            ["provider.model", "string?", "\u2014", "Override the default model for a provider"],
            ["provider.apiKeyEnv", "string?", "\u2014", "Custom env variable name for the API key"],
            ["providerPriority", "string[]?", "\u2014", "Custom auto-detect order (see Provider Setup)"],
            ["include", "string[]", '["app/**/*.{tsx,jsx}"]', "Glob patterns for source files to scan"],
            ["exclude", "string[]", '["**/*.test.*"]', "Glob patterns to exclude"],
            ["output.format", "string", '"next-intl"', "Output format: next-intl or i18next"],
            ["output.path", "string", '"locales"', "Directory for generated translation files"],
            ["projectId", "string?", "\u2014", "Auto-set during init \u2014 links to your dashboard project"],
            ["publicKey", "string?", "\u2014", "Auto-set during init \u2014 used for widget analytics"],
          ]}
        />
      </DocsSection>

      {/* ---- Providers ---- */}
      <DocsSection id="providers" title="Provider Setup" subtitle="Configure your AI translation provider.">
        <p className="text-sm text-[var(--text-secondary)]">
          Add your provider&apos;s API key to{" "}
          <code className="font-mono text-[var(--foreground)]">.env.local</code>{" "}
          (or <code className="font-mono text-[var(--foreground)]">.env</code>).
          Transia auto-detects whichever key you provide.
        </p>
        <DocsTable
          headers={["Provider", "Env Variable", "Default Model"]}
          rows={[
            ["OpenAI", "OPENAI_API_KEY", "gpt-4o-mini"],
            ["Anthropic", "ANTHROPIC_API_KEY", "claude-sonnet-4-5-20250929"],
            ["Gemini", "GEMINI_API_KEY", "gemini-2.0-flash"],
            ["Grok (xAI)", "XAI_API_KEY", "grok-2-latest"],
            ["Managed", "\u2014 (none needed)", "Transia cloud"],
          ]}
        />
        <DocsCodeBlock
          filename=".env.local"
          code={`# Add any one of these:\nGEMINI_API_KEY=your-key-here\n# or\nOPENAI_API_KEY=your-key-here\n# or\nANTHROPIC_API_KEY=your-key-here\n# or\nXAI_API_KEY=your-key-here`}
        />

        <h3 className="mt-8 text-lg font-semibold text-[var(--foreground)]">
          Auto-detect &amp; Provider Priority
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          When you set{" "}
          <code className="font-mono text-[var(--foreground)]">provider.name</code>{" "}
          to{" "}
          <code className="font-mono text-[var(--foreground)]">&quot;auto&quot;</code>{" "}
          (the default), Transia scans your{" "}
          <code className="font-mono text-[var(--foreground)]">.env.local</code>{" "}
          for API keys in this order and uses the <strong>first one it finds</strong>:
        </p>
        <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--text-secondary)]">
          <li><code className="font-mono text-[var(--foreground)]">GEMINI_API_KEY</code> (Google Gemini \u2014 fastest and most affordable)</li>
          <li><code className="font-mono text-[var(--foreground)]">XAI_API_KEY</code> (Grok)</li>
          <li><code className="font-mono text-[var(--foreground)]">OPENAI_API_KEY</code> (OpenAI)</li>
          <li><code className="font-mono text-[var(--foreground)]">ANTHROPIC_API_KEY</code> (Anthropic Claude)</li>
        </ol>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          For example, if you have both{" "}
          <code className="font-mono text-[var(--foreground)]">GEMINI_API_KEY</code> and{" "}
          <code className="font-mono text-[var(--foreground)]">OPENAI_API_KEY</code> in
          your .env.local, Transia will use Gemini because it comes first in the
          default priority.
        </p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          To change this order, add a{" "}
          <code className="font-mono text-[var(--foreground)]">providerPriority</code>{" "}
          array to your{" "}
          <code className="font-mono text-[var(--foreground)]">transia.config.json</code>:
        </p>
        <DocsCodeBlock
          filename="transia.config.json"
          code={`{
  "provider": { "name": "auto" },
  "providerPriority": ["openai", "anthropic"]
}`}
        />
        <p className="text-sm text-[var(--text-secondary)]">
          With this config, Transia will check for your OpenAI key first.
          If not found, it tries Anthropic. If neither is found, it shows an
          error asking you to add a key.
        </p>

        <h3 className="mt-8 text-lg font-semibold text-[var(--foreground)]">
          Managed Provider
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          The managed provider uses Transia cloud for translations \u2014 no API key
          needed. Available on Pro and Team plans. Set{" "}
          <code className="font-mono text-[var(--foreground)]">provider.name</code> to{" "}
          <code className="font-mono text-[var(--foreground)]">&quot;managed&quot;</code> in your config.
        </p>
      </DocsSection>

      {/* ---- CLI Reference ---- */}
      <DocsSection id="cli-reference" title="CLI Reference" subtitle="Complete list of all Transia commands.">
        <DocsTable
          headers={["Command", "Description"]}
          rows={[
            ["transia", "Smart workflow \u2014 detects state and guides you through everything"],
            ["transia login", "Authenticate via browser"],
            ["transia logout", "Remove stored credentials"],
            ["transia init", "Initialize project config (interactive)"],
            ["transia translate", "Extract and translate strings"],
            ["transia setup", "Wire up your app to use translations"],
            ["transia apply", "Rewrite source files with t() calls"],
            ["transia widget", "Add the language switcher widget"],
            ["transia status", "Show translation coverage per locale"],
            ["transia reset", "Delete translation state (--confirm required)"],
          ]}
        />
        <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
          Global Flags
        </h3>
        <DocsTable
          headers={["Flag", "Description"]}
          rows={[
            ["--version", "Show CLI version"],
            ["--help", "Show help for any command"],
          ]}
        />
      </DocsSection>

      {/* ---- FAQ ---- */}
      <DocsSection id="faq" title="FAQ" subtitle="Frequently asked questions.">
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <FaqItem
            question="Do I need an account to use Transia?"
            answer="Yes. A free Transia account is required to use the CLI. This lets us sync projects to your dashboard, track usage, and provide the best experience. Sign up is quick — just run transia login and authenticate in your browser."
          />
          <FaqItem
            question="Which frameworks are supported?"
            answer="Transia supports React, Next.js, Remix, and Gatsby. It auto-detects your framework during initialization and generates the appropriate configuration."
          />
          <FaqItem
            question="Is my source code sent to AI providers?"
            answer="Only the translatable text strings are sent — not your full source code. Strings are also sanitized to remove any secrets, API keys, or connection strings before being sent."
          />
          <FaqItem
            question="How does delta detection work?"
            answer="Each translatable string is SHA-256 hashed. On subsequent runs, only new or changed strings are sent for translation. This saves time and API costs. Use --force to re-translate everything."
          />
          <FaqItem
            question="Can I use multiple AI providers?"
            answer='Yes. Set provider to "auto" and add multiple API keys to your .env.local. Transia uses the first key it finds in priority order (Gemini, Grok, OpenAI, Anthropic by default). You can customize this order with the providerPriority field in transia.config.json — see the Provider Setup section for details.'
          />
          <FaqItem
            question="What does transia setup do? Is it required?"
            answer='The setup command configures your project to load and display translations. It installs the required dependencies, creates config files, and sets up routing and middleware. Without it, your translated files exist but your app cannot use them. If you use the smart transia command, setup runs automatically — you only need to run it manually if using individual commands.'
          />
          <FaqItem
            question="How do I add a new locale after initial setup?"
            answer='Edit transia.config.json and add the new locale code to the targetLocales array, then run transia translate. The new locale will be translated while existing translations are preserved.'
          />
          <FaqItem
            question="What happens if a translation fails mid-batch?"
            answer="Transia saves state checkpoints every 5 batches and after each locale. If something fails, just run transia translate again — it will pick up where it left off thanks to delta detection."
          />
        </div>
      </DocsSection>
    </div>
  );
}
