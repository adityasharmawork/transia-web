import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { requireCliUser, isAuthError } from "@/lib/cli-auth";
import { connectDB, Project, generateApiKey } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const FREE_PROJECT_LIMIT = 3;
const PRO_PROJECT_LIMIT = 10;

const cliProjectsLimiter = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:cli-projects",
});

export async function GET(req: Request) {
  const userOrError = await requireCliUser(req);
  if (isAuthError(userOrError)) return userOrError;
  const user = userOrError;

  const rateLimitResponse = await checkRateLimit(
    cliProjectsLimiter,
    user._id.toString(),
  );
  if (rateLimitResponse) return rateLimitResponse;

  await connectDB();

  const projects = await Project.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const userOrError = await requireCliUser(req);
  if (isAuthError(userOrError)) return userOrError;
  const user = userOrError;

  const rateLimitResponse = await checkRateLimit(
    cliProjectsLimiter,
    user._id.toString(),
  );
  if (rateLimitResponse) return rateLimitResponse;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, sourceLocale, targetLocales, outputFormat } = body as {
    name?: string;
    sourceLocale?: string;
    targetLocales?: string[];
    outputFormat?: string;
  };

  // Input validation
  const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
  const VALID_FORMATS = ["next-intl", "i18next"];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 },
    );
  }
  if (name.length > 255) {
    return NextResponse.json(
      { error: "Project name must be 255 characters or less" },
      { status: 400 },
    );
  }
  if (sourceLocale && !LOCALE_RE.test(sourceLocale)) {
    return NextResponse.json(
      { error: "Invalid sourceLocale format" },
      { status: 400 },
    );
  }
  if (targetLocales) {
    if (!Array.isArray(targetLocales) || targetLocales.length > 100) {
      return NextResponse.json(
        { error: "targetLocales must be an array with at most 100 items" },
        { status: 400 },
      );
    }
    for (const loc of targetLocales) {
      if (typeof loc !== "string" || !LOCALE_RE.test(loc)) {
        return NextResponse.json(
          { error: `Invalid locale in targetLocales: ${loc}` },
          { status: 400 },
        );
      }
    }
  }

  if (outputFormat && !VALID_FORMATS.includes(outputFormat)) {
    return NextResponse.json(
      { error: `Invalid outputFormat. Must be one of: ${VALID_FORMATS.join(", ")}` },
      { status: 400 },
    );
  }

  await connectDB();

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
      { status: 403 },
    );
  }

  const { fullKey, hash, prefix } = generateApiKey();

  try {
    const project = await Project.create({
      userId: user._id,
      name: name.trim(),
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      sourceLocale: sourceLocale || "en",
      targetLocales: targetLocales || [],
      outputFormat: outputFormat || "next-intl",
    });

    return NextResponse.json(
      {
        project: {
          _id: project._id,
          name: project.name,
          publicKey: project.publicKey,
          apiKey: fullKey,
          sourceLocale: project.sourceLocale,
          targetLocales: project.targetLocales,
          outputFormat: project.outputFormat,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
