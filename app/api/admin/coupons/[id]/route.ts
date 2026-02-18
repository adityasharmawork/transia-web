import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin";
import { DiscountCoupon } from "@/lib/db";
import { isPaidTier, PAID_TIERS } from "@/lib/billing/constants";
import { adminMutationLimiter, checkRateLimit } from "@/lib/rate-limit";

const COUPON_CODE_RE = /^[A-Z0-9_-]{3,32}$/;

interface CouponPatchBody {
  code?: string;
  percentOff?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  maxRedemptions?: number | null;
  allowedTiers?: string[];
}

function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value");
  }
  return parsed;
}

function parseAllowedTiers(
  value: string[] | undefined
): ("pro" | "team")[] | undefined {
  if (value === undefined) return undefined;
  if (value.length === 0) return [...PAID_TIERS];
  const normalized = value.map((tier) => tier.trim().toLowerCase());
  if (normalized.some((tier) => !isPaidTier(tier))) {
    throw new Error("Invalid allowedTiers value");
  }
  return [...new Set(normalized)] as ("pro" | "team")[];
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
    const coupon = await DiscountCoupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const body = (await req.json()) as CouponPatchBody;

    if (body.code !== undefined) {
      const normalized = body.code.trim().toUpperCase();
      if (!COUPON_CODE_RE.test(normalized)) {
        return NextResponse.json(
          { error: "Invalid coupon code format" },
          { status: 400 }
        );
      }
      coupon.code = normalized;
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
      coupon.percentOff = body.percentOff;
    }

    if (body.active !== undefined) {
      coupon.active = Boolean(body.active);
    }

    if (body.startsAt !== undefined) {
      const parsedStartsAt = parseDate(body.startsAt);
      coupon.startsAt = parsedStartsAt ?? null;
    }
    if (body.endsAt !== undefined) {
      const parsedEndsAt = parseDate(body.endsAt);
      coupon.endsAt = parsedEndsAt ?? null;
    }

    if (coupon.startsAt && coupon.endsAt && coupon.startsAt > coupon.endsAt) {
      return NextResponse.json(
        { error: "startsAt must be before endsAt" },
        { status: 400 }
      );
    }

    if (body.maxRedemptions !== undefined) {
      if (
        body.maxRedemptions !== null &&
        (!Number.isInteger(body.maxRedemptions) || body.maxRedemptions < 1)
      ) {
        return NextResponse.json(
          { error: "maxRedemptions must be null or a positive integer" },
          { status: 400 }
        );
      }
      coupon.maxRedemptions = body.maxRedemptions ?? null;
    }

    if (body.allowedTiers !== undefined) {
      const tiers = parseAllowedTiers(body.allowedTiers);
      coupon.allowedTiers = tiers ?? [...PAID_TIERS];
    }

    await coupon.save();

    return NextResponse.json({ coupon });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid date value") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Invalid allowedTiers value") {
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
