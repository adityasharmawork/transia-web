"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyIconButton } from "@/app/components/shared/copy-icon-button";

interface Project {
  _id: string;
  name: string;
  apiKeyPrefix: string;
  sourceLocale: string;
  targetLocales: string[];
  outputFormat: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newProjectKey, setNewProjectKey] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const data = await res.json();
      setNewProjectKey(data.project?.apiKey || null);
      setNewName("");
      setShowCreate(false);
      fetchProjects();
    } finally {
      setCreating(false);
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Projects
          </h1>
          <p className="mt-1 font-mono text-sm text-[var(--text-secondary)]">
            Manage your translation projects
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg border border-[var(--border-hover)] bg-[var(--foreground)] px-4 py-2 font-mono text-sm text-[var(--background)] transition-colors hover:opacity-90"
        >
          New Project
        </button>
      </div>

      {newProjectKey && (
        <div className="mb-6 rounded-lg border border-[var(--terminal-green)]/30 bg-[var(--terminal-green)]/5 p-4">
          <p className="mb-2 font-mono text-xs text-[var(--terminal-green)]">
            Project created! Copy your API key now — it will only be shown once.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--foreground)]">
              {newProjectKey}
            </code>
            <CopyIconButton text={newProjectKey} />
            <button
              onClick={() => setNewProjectKey(null)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={createProject}
          className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
            Create Project
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name (e.g., my-website)"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)] focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-[var(--foreground)] px-4 py-2 font-mono text-sm text-[var(--background)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setError("");
              }}
              className="rounded-lg border border-[var(--border)] px-4 py-2 font-mono text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="mt-3 font-mono text-sm text-[var(--terminal-red)]">
              {error}
            </p>
          )}
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            No projects yet
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--text-muted)]">
            Create your first project to get started with Transia
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--surface-raised)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-[var(--foreground)] group-hover:underline">
                    {project.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {project.sourceLocale} →{" "}
                      {project.targetLocales.length > 0
                        ? project.targetLocales.join(", ")
                        : "no targets"}
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {project.outputFormat}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
