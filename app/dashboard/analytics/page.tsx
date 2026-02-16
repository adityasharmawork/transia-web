"use client";

import { useEffect, useState } from "react";

interface Project {
  _id: string;
  name: string;
}

interface AnalyticsData {
  totalLoads: number;
  totalSwitches: number;
  switchRate: number;
  topLanguage: string | null;
  languageDistribution: Array<{ locale: string; count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  retentionDays: number;
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0]._id);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    fetch(`/api/analytics/${selectedProject}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm text-[var(--text-secondary)]">
          Loading...
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[var(--text-secondary)]">
          No projects yet
        </p>
        <p className="mt-2 font-mono text-sm text-[var(--text-muted)]">
          Create a project first to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Analytics
          </h1>
          <p className="mt-1 font-mono text-sm text-[var(--text-secondary)]">
            Widget usage and language insights
          </p>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--border-hover)] focus:outline-none"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="font-mono text-sm text-[var(--text-secondary)]">
            Loading analytics...
          </p>
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Widget Loads"
              value={analytics.totalLoads.toLocaleString()}
            />
            <StatCard
              label="Language Switches"
              value={analytics.totalSwitches.toLocaleString()}
            />
            <StatCard
              label="Switch Rate"
              value={`${analytics.switchRate}%`}
            />
            <StatCard
              label="Top Language"
              value={analytics.topLanguage || "—"}
            />
          </div>

          {/* Language Distribution */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
              Language Distribution
            </h2>
            {analytics.languageDistribution.length > 0 ? (
              <div className="space-y-3">
                {analytics.languageDistribution.map((item) => {
                  const maxCount = analytics.languageDistribution[0]?.count || 1;
                  const width = Math.max(
                    (item.count / maxCount) * 100,
                    2
                  );
                  return (
                    <div key={item.locale} className="flex items-center gap-4">
                      <span className="w-12 font-mono text-sm text-[var(--foreground)]">
                        {item.locale}
                      </span>
                      <div className="flex-1">
                        <div
                          className="h-6 rounded bg-[var(--foreground)]/10"
                          style={{ width: `${width}%` }}
                        >
                          <div
                            className="h-full rounded bg-[var(--foreground)]/30"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                      <span className="w-16 text-right font-mono text-sm text-[var(--text-secondary)]">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-mono text-sm text-[var(--text-muted)]">
                No language switch data yet. Add the Transia widget to your
                site.
              </p>
            )}
          </section>

          {/* Daily Trend */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
              Daily Trend
            </h2>
            {analytics.dailyTrend.length > 0 ? (
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {analytics.dailyTrend.map((day) => {
                  const maxCount = Math.max(
                    ...analytics.dailyTrend.map((d) => d.count)
                  );
                  const height = Math.max(
                    (day.count / maxCount) * 100,
                    4
                  );
                  return (
                    <div
                      key={day.date}
                      className="group relative flex-1"
                      title={`${day.date}: ${day.count}`}
                    >
                      <div
                        className="w-full rounded-t bg-[var(--foreground)]/20 transition-colors hover:bg-[var(--foreground)]/40"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-mono text-sm text-[var(--text-muted)]">
                No data for the selected period.
              </p>
            )}
          </section>

          {/* Top Pages */}
          {analytics.topPages.length > 0 && (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="mb-4 text-lg font-medium text-[var(--foreground)]">
                Top Pages
              </h2>
              <div className="space-y-2">
                {analytics.topPages.map((item) => (
                  <div
                    key={item.page}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  >
                    <span className="font-mono text-sm text-[var(--foreground)]">
                      {item.page || "/"}
                    </span>
                    <span className="font-mono text-sm text-[var(--text-secondary)]">
                      {item.count.toLocaleString()} switches
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Insights */}
          <section className="rounded-lg border border-[var(--terminal-yellow)]/20 bg-[var(--terminal-yellow)]/5 p-6">
            <h2 className="mb-3 text-lg font-medium text-[var(--foreground)]">
              Insights
            </h2>
            <div className="space-y-2 font-mono text-sm text-[var(--text-secondary)]">
              {analytics.switchRate > 0 && (
                <p>
                  {analytics.switchRate}% of visitors switch languages — your
                  multilingual content is being used.
                </p>
              )}
              {analytics.topLanguage && (
                <p>
                  {analytics.topLanguage} is the most requested language.
                  Consider prioritizing content quality for this locale.
                </p>
              )}
              {analytics.totalLoads > 0 && analytics.totalSwitches === 0 && (
                <p>
                  Your widget is loading but no one has switched languages yet.
                  Make sure your target locales are relevant to your audience.
                </p>
              )}
              <p className="text-[var(--text-muted)]">
                Data retention: {analytics.retentionDays} days (
                {analytics.retentionDays <= 7
                  ? "upgrade to Pro for 90 days"
                  : analytics.retentionDays <= 90
                    ? "upgrade to Team for 1 year"
                    : "Team plan"}
                )
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="font-mono text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
