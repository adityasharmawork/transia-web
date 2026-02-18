import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { SaleCampaign } from "@/lib/db";
import { isPaidTier, PAID_TIERS } from "@/lib/billing/constants";
import { adminMutationLimiter, checkRateLimit } from "@/lib/rate-limit";

interface CampaignCreateBody {
  name?: string;
  description?: string | null;
  percentOff?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  allowedTiers?: string[];
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  return date;
}

function parseAllowedTiers(value: string[] | undefined): ("pro" | "team")[] {
  if (!value || value.length === 0) return [...PAID_TIERS];
  const tiers = value.map((tier) => tier.trim().toLowerCase());
  if (tiers.some((tier) => !isPaidTier(tier))) {
    throw new Error("Invalid allowedTiers value");
  }
  return [...new Set(tiers)] as ("pro" | "team")[];
}

export async function GET() {
  try {
    await requireAdminUser();
    const campaigns = await SaleCampaign.find({})
      .sort({ active: -1, priority: -1, createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({ campaigns });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    const rateLimited = await checkRateLimit(
      adminMutationLimiter,
      admin._id.toString()
    );
    if (rateLimited) return rateLimited;

    const body = (await req.json()) as CampaignCreateBody;
    if (!body.name || body.name.trim().length < 3) {
      return NextResponse.json(
        { error: "name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (
      typeof body.percentOff !== "number" ||
      !Number.isFinite(body.percentOff) ||
      body.percentOff < 1 ||
      body.percentOff > 100
    ) {
      return NextResponse.json(
        { error: "percentOff must be a number between 1 and 100" },
        { status: 400 }
      );
    }

    if (
      body.priority !== undefined &&
      (!Number.isInteger(body.priority) || body.priority < -100 || body.priority > 100)
    ) {
      return NextResponse.json(
        { error: "priority must be an integer between -100 and 100" },
        { status: 400 }
      );
    }

    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);
    if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
      return NextResponse.json(
        { error: "startsAt must be before endsAt" },
        { status: 400 }
      );
    }

    const allowedTiers = parseAllowedTiers(body.allowedTiers);

    const campaign = await SaleCampaign.create({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      percentOff: body.percentOff,
      active: body.active ?? true,
      startsAt,
      endsAt,
      priority: body.priority ?? 0,
      allowedTiers,
      createdBy: admin.email,
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Invalid date value" ||
        error.message === "Invalid allowedTiers value")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const status =
      error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}
