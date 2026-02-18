import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { DiscountCoupon } from "@/lib/db";
import { adminMutationLimiter, checkRateLimit } from "@/lib/rate-limit";
import { isPaidTier, PAID_TIERS } from "@/lib/billing/constants";

const COUPON_CODE_RE = /^[A-Z0-9_-]{3,32}$/;

interface CouponCreateBody {
  code?: string;
  percentOff?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  maxRedemptions?: number | null;
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
    const coupons = await DiscountCoupon.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({ coupons });
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

    const body = (await req.json()) as CouponCreateBody;

    const normalizedCode = body.code?.trim().toUpperCase();
    if (!normalizedCode || !COUPON_CODE_RE.test(normalizedCode)) {
      return NextResponse.json(
        { error: "Invalid coupon code format" },
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

    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);
    if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
      return NextResponse.json(
        { error: "startsAt must be before endsAt" },
        { status: 400 }
      );
    }

    if (
      body.maxRedemptions !== undefined &&
      body.maxRedemptions !== null &&
      (!Number.isInteger(body.maxRedemptions) || body.maxRedemptions < 1)
    ) {
      return NextResponse.json(
        { error: "maxRedemptions must be null or a positive integer" },
        { status: 400 }
      );
    }

    const allowedTiers = parseAllowedTiers(body.allowedTiers);

    const coupon = await DiscountCoupon.create({
      code: normalizedCode,
      percentOff: body.percentOff,
      active: body.active ?? true,
      startsAt,
      endsAt,
      maxRedemptions: body.maxRedemptions ?? null,
      allowedTiers,
      createdBy: admin.email,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Invalid date value" ||
        error.message === "Invalid allowedTiers value")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const status =
      error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}
