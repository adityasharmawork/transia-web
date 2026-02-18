"use client";

import { useEffect, useState, use, useCallback } from "react";
import { CopyIconButton } from "@/app/components/shared/copy-icon-button";

interface Project {
  _id: string;
  name: string;
  apiKeyPrefix: string;
  publicKey: string;
  sourceLocale: string;
  targetLocales: string[];
  outputFormat: string;
  analyticsEnabled: boolean;
  createdAt: string;
}

interface UsageLog {
  _id: string;
  stringsTranslated: number;
  tokensUsed: number;
  provider: string;
  locale: string;
  createdAt: string;
}

interface ProjectData {
  project: Project;
  usage: {
    totalStrings: number;
    totalTokens: number;
    recentLogs: UsageLog[];
  };
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [updatingAnalytics, setUpdatingAnalytics] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const payload = await res.json();
        if (
          payload?.project &&
          typeof payload.project.analyticsEnabled !== "boolean"
        ) {
          payload.project.analyticsEnabled = true;
        }
        setData(payload);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function regenerateKey() {
    if (!confirm("Regenerate API key? The old key will stop working immediately. Make sure to copy the new key — it will only be shown once.")) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await fetch(`/api/projects/${id}/regenerate-key`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.apiKey);
        fetchProject();
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function toggleAnalytics(nextValue: boolean) {
    setUpdatingAnalytics(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analyticsEnabled: nextValue }),
      });
      if (!res.ok) return;

      setData((prev) =>
        prev
          ? {
              ...prev,
              project: {
                ...prev.project,
                analyticsEnabled: nextValue,
              },
            }
          : prev
      );
    } finally {
      setUpdatingAnalytics(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="font-mono text-sm text-[var(--text-secondary)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[var(--text-secondary)]">
          Project not found
        </p>
      </div>
    );
  }

  const { project, usage } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          {project.name}
        </h1>
        <p className="mt-1 font-mono text-sm text-[var(--text-secondary)]">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* API Key */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
          API Key
        </h2>

        {newKey && (
          <div className="mb-4 rounded-lg border border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 p-4">
            <p className="mb-2 font-mono text-xs text-[var(--terminal-green)]">
              New API key generated. Copy it now — it will only be shown once.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--foreground)]">
                {newKey}
              </code>
              <CopyIconButton text={newKey} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <code className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--text-muted)]">
            {project.apiKeyPrefix}
          </code>
          <button
            onClick={regenerateKey}
            disabled={regenerating}
            className="rounded-lg border border-[var(--terminal-red)]/30 px-3 py-2 font-mono text-xs text-[var(--terminal-red)] transition-colors hover:bg-[var(--terminal-red)]/10 disabled:opacity-50"
          >
            {regenerating ? "..." : "Regenerate"}
          </button>
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          For security, the full key is only shown at creation. If you lost it, regenerate a new one.
        </p>
      </section>

      {/* Widget Key (Public) */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
          Widget Key
        </h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--foreground)]">
            {project.publicKey}
          </code>
          <CopyIconButton text={project.publicKey} />
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Use this key in your widget. It is safe to expose in client-side code — it can only send analytics, not trigger translations.
        </p>
      </section>

      {/* Analytics Tracking */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-2 text-lg font-medium text-[var(--foreground)]">
          Analytics Tracking
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Control whether widget usage analytics are collected for this project.
        </p>
        <button
          onClick={() => toggleAnalytics(!project.analyticsEnabled)}
          disabled={updatingAnalytics}
          className={`rounded-lg px-4 py-2 font-mono text-sm transition-colors ${
            project.analyticsEnabled
              ? "bg-[var(--terminal-green)]/10 text-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/20"
              : "border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          } disabled:opacity-50`}
        >
          {updatingAnalytics
            ? "Updating..."
            : project.analyticsEnabled
              ? "Disable Analytics"
              : "Enable Analytics"}
        </button>
      </section>

      {/* Quick Start */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
          Quick Start
        </h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              1. Install the CLI
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--terminal-green)]">
                npm install -g transia
              </code>
              <CopyIconButton text="npm install -g transia" />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              2. Log in to your account
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--terminal-green)]">
                transia login
              </code>
              <CopyIconButton text="transia login" />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              3. Initialize your project
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--terminal-green)]">
                transia init
              </code>
              <CopyIconButton text="transia init" />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              4. Translate your app
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--terminal-green)]">
                transia translate --target{" "}
                {project.targetLocales.length > 0
                  ? project.targetLocales.join(",")
                  : "es,fr,de"}
              </code>
              <CopyIconButton
                text={`transia translate --target ${project.targetLocales.length > 0 ? project.targetLocales.join(",") : "es,fr,de"}`}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              5. Add the language widget (optional)
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--terminal-green)]">
                {`<TransiaWidget projectId="${project.publicKey}" ... />`}
              </code>
              <CopyIconButton text={project.publicKey} />
            </div>
          </div>
        </div>
      </section>

      {/* Usage Stats */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
          Usage
        </h2>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="font-mono text-xs text-[var(--text-muted)]">
              Total Strings Translated
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {usage.totalStrings.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="font-mono text-xs text-[var(--text-muted)]">
              Total Tokens Used
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {usage.totalTokens.toLocaleString()}
            </p>
          </div>
        </div>

        {usage.recentLogs.length > 0 ? (
          <div>
            <h3 className="mb-3 font-mono text-sm text-[var(--text-secondary)]">
              Recent Activity
            </h3>
            <div className="space-y-2">
              {usage.recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-[var(--foreground)]">
                      {log.stringsTranslated} strings → {log.locale}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      via {log.provider}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center font-mono text-sm text-[var(--text-muted)]">
            No translations yet. Run{" "}
            <code className="text-[var(--terminal-green)]">
              transia translate
            </code>{" "}
            to get started.
          </p>
        )}
      </section>

      {/* Configuration */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
          Configuration
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              Source Locale
            </p>
            <p className="mt-1 font-mono text-sm text-[var(--foreground)]">
              {project.sourceLocale}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              Target Locales
            </p>
            <p className="mt-1 font-mono text-sm text-[var(--foreground)]">
              {project.targetLocales.length > 0
                ? project.targetLocales.join(", ")
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              Output Format
            </p>
            <p className="mt-1 font-mono text-sm text-[var(--foreground)]">
              {project.outputFormat}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
