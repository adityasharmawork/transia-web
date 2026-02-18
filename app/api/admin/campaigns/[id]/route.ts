import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { SaleCampaign } from "@/lib/db";
import { isPaidTier, PAID_TIERS } from "@/lib/billing/constants";
import { adminMutationLimiter, checkRateLimit } from "@/lib/rate-limit";

interface CampaignPatchBody {
  name?: string;
  description?: string | null;
  percentOff?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  allowedTiers?: string[];
}

function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  return date;
}

function parseAllowedTiers(
  value: string[] | undefined
): ("pro" | "team")[] | undefined {
  if (value === undefined) return undefined;
  if (value.length === 0) return [...PAID_TIERS];
  const tiers = value.map((tier) => tier.trim().toLowerCase());
  if (tiers.some((tier) => !isPaidTier(tier))) {
    throw new Error("Invalid allowedTiers value");
  }
  return [...new Set(tiers)] as ("pro" | "team")[];
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const rateLimited = await checkRateLimit(
      adminMutationLimiter,
      admin._id.toString()
    );
    if (rateLimited) return rateLimited;

    const { id } = await params;
    const campaign = await SaleCampaign.findById(id);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const body = (await req.json()) as CampaignPatchBody;

    if (body.name !== undefined) {
      if (body.name.trim().length < 3) {
        return NextResponse.json(
          { error: "name must be at least 3 characters" },
          { status: 400 }
        );
      }
      campaign.name = body.name.trim();
    }

    if (body.description !== undefined) {
      campaign.description = body.description?.trim() || null;
    }

    if (body.percentOff !== undefined) {
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
      campaign.percentOff = body.percentOff;
    }

    if (body.active !== undefined) {
      campaign.active = Boolean(body.active);
    }

    if (body.priority !== undefined) {
      if (
        !Number.isInteger(body.priority) ||
        body.priority < -100 ||
        body.priority > 100
      ) {
        return NextResponse.json(
          { error: "priority must be an integer between -100 and 100" },
          { status: 400 }
        );
      }
      campaign.priority = body.priority;
    }

    if (body.startsAt !== undefined) {
      const parsedStartsAt = parseDate(body.startsAt);
      campaign.startsAt = parsedStartsAt ?? null;
    }
    if (body.endsAt !== undefined) {
      const parsedEndsAt = parseDate(body.endsAt);
      campaign.endsAt = parsedEndsAt ?? null;
    }

    if (campaign.startsAt && campaign.endsAt && campaign.startsAt > campaign.endsAt) {
      return NextResponse.json(
        { error: "startsAt must be before endsAt" },
        { status: 400 }
      );
    }

    if (body.allowedTiers !== undefined) {
      const tiers = parseAllowedTiers(body.allowedTiers);
      campaign.allowedTiers = tiers ?? [...PAID_TIERS];
    }

    await campaign.save();

    return NextResponse.json({ campaign });
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
