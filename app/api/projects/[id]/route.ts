import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Project, UsageLog } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { id } = await params;
    const project = await Project.findOne({
      _id: id,
      userId: user._id,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const usageLogs = await UsageLog.find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalStrings = usageLogs.reduce(
      (sum, log) => sum + log.stringsTranslated,
      0
    );
    const totalTokens = usageLogs.reduce(
      (sum, log) => sum + log.tokensUsed,
      0
    );

    const projectWithDefaults = {
      ...project,
      analyticsEnabled: project.analyticsEnabled !== false,
    };

    return NextResponse.json({
      project: projectWithDefaults,
      usage: { totalStrings, totalTokens, recentLogs: usageLogs },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { id } = await params;
    const body = (await req.json()) as { analyticsEnabled?: boolean };

    if (typeof body.analyticsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "analyticsEnabled must be a boolean" },
        { status: 400 }
      );
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: user._id },
      { analyticsEnabled: body.analyticsEnabled },
      { new: true }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
