import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Project, generateApiKey } from "@/lib/db";

const FREE_PROJECT_LIMIT = 3;
const PRO_PROJECT_LIMIT = 10;

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const projects = await Project.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await connectDB();

    const { name, sourceLocale, targetLocales, outputFormat } =
      await req.json();

    // M1: Input validation
    const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }
    if (name.length > 255) {
      return NextResponse.json(
        { error: "Project name must be 255 characters or less" },
        { status: 400 }
      );
    }
    if (sourceLocale && !LOCALE_RE.test(sourceLocale)) {
      return NextResponse.json(
        { error: "Invalid sourceLocale format" },
        { status: 400 }
      );
    }
    if (targetLocales) {
      if (!Array.isArray(targetLocales) || targetLocales.length > 100) {
        return NextResponse.json(
          { error: "targetLocales must be an array with at most 100 items" },
          { status: 400 }
        );
      }
      for (const loc of targetLocales) {
        if (typeof loc !== "string" || !LOCALE_RE.test(loc)) {
          return NextResponse.json(
            { error: `Invalid locale in targetLocales: ${loc}` },
            { status: 400 }
          );
        }
      }
    }

    const projectCount = await Project.countDocuments({ userId: user._id });
    const limit =
      user.tier === "team"
        ? Infinity
        : user.tier === "pro"
          ? PRO_PROJECT_LIMIT
          : FREE_PROJECT_LIMIT;

    if (projectCount >= limit) {
      return NextResponse.json(
        {
          error: `Project limit reached (${limit}). Upgrade your plan for more projects.`,
        },
        { status: 403 }
      );
    }

    const { fullKey, hash, prefix } = generateApiKey();

    const project = await Project.create({
      userId: user._id,
      name: name.trim(),
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      sourceLocale: sourceLocale || "en",
      targetLocales: targetLocales || [],
      outputFormat: outputFormat || "next-intl",
    });

    // Return the full API key only at creation time — it is never stored
    return NextResponse.json(
      {
        project: {
          ...project.toObject(),
          apiKey: fullKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
