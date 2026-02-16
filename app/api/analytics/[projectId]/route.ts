import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Project, AnalyticsEvent } from "@/lib/db";

// 0 = lifetime (no date filter applied)
const TIER_RETENTION_DAYS: Record<string, number> = {
  free: 30,
  pro: 365,
  team: 0,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { projectId } = await params;
    const project = await Project.findOne({
      _id: projectId,
      userId: user._id,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const retentionDays = TIER_RETENTION_DAYS[user.tier] ?? 7;
    // 0 = lifetime retention (Team tier)
    const since =
      retentionDays > 0
        ? new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
        : null;

    const dateFilter = since ? { createdAt: { $gte: since } } : {};

    // Language distribution
    const languageDistribution = await AnalyticsEvent.aggregate([
      {
        $match: {
          projectId: project._id,
          eventType: "widget.language_selected",
          ...dateFilter,
        },
      },
      { $group: { _id: "$locale", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Daily trend (last 30 days or retention limit)
    const trendDays = retentionDays > 0 ? Math.min(30, retentionDays) : 30;
    const trendSince = new Date(
      Date.now() - trendDays * 24 * 60 * 60 * 1000
    );

    const dailyTrend = await AnalyticsEvent.aggregate([
      {
        $match: {
          projectId: project._id,
          eventType: "widget.language_selected",
          createdAt: { $gte: trendSince },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total counts
    const totalLoads = await AnalyticsEvent.countDocuments({
      projectId: project._id,
      eventType: "widget.loaded",
      ...dateFilter,
    });

    const totalSwitches = await AnalyticsEvent.countDocuments({
      projectId: project._id,
      eventType: "widget.language_selected",
      ...dateFilter,
    });

    // Top pages
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          projectId: project._id,
          eventType: "widget.language_selected",
          ...dateFilter,
        },
      },
      { $group: { _id: "$pageUrl", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Country breakdown
    const countryBreakdown = await AnalyticsEvent.aggregate([
      {
        $match: {
          projectId: project._id,
          eventType: "widget.loaded",
          ...dateFilter,
          country: { $ne: "" },
        },
      },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    return NextResponse.json({
      totalLoads,
      totalSwitches,
      switchRate:
        totalLoads > 0
          ? Math.round((totalSwitches / totalLoads) * 100)
          : 0,
      topLanguage:
        languageDistribution.length > 0
          ? languageDistribution[0]._id
          : null,
      languageDistribution: languageDistribution.map((d) => ({
        locale: d._id,
        count: d.count,
      })),
      dailyTrend: dailyTrend.map((d) => ({
        date: d._id,
        count: d.count,
      })),
      topPages: topPages.map((d) => ({
        page: d._id,
        count: d.count,
      })),
      countryBreakdown: countryBreakdown.map((d) => ({
        country: d._id,
        count: d.count,
      })),
      retentionDays,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
