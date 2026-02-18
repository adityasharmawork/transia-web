import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { User } from "@/lib/db";
import { checkRateLimit, referralClaimLimiter } from "@/lib/rate-limit";

const REFERRAL_CODE_RE = /^[A-Z0-9]{6,16}$/;

interface ClaimBody {
  code?: string;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const rateLimited = await checkRateLimit(
      referralClaimLimiter,
      user._id.toString()
    );
    if (rateLimited) return rateLimited;

    const body = (await req.json()) as ClaimBody;
    const code = body.code?.trim().toUpperCase();

    if (!code || !REFERRAL_CODE_RE.test(code)) {
      return NextResponse.json(
        { error: "Invalid referral code format" },
        { status: 400 }
      );
    }

    if (user.firstPaidAt) {
      return NextResponse.json(
        { error: "Referral codes can only be claimed before your first paid purchase" },
        { status: 409 }
      );
    }

    if (user.referredByUserId) {
      return NextResponse.json(
        { error: "A referral code has already been claimed" },
        { status: 409 }
      );
    }

    const referrer = await User.findOne({ referralCode: code })
      .select("_id")
      .lean();
    if (!referrer) {
      return NextResponse.json(
        { error: "Referral code not found" },
        { status: 404 }
      );
    }

    if (referrer._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: "You cannot claim your own referral code" },
        { status: 400 }
      );
    }

    const updated = await User.updateOne(
      { _id: user._id, referredByUserId: null, firstPaidAt: null },
      { $set: { referredByUserId: referrer._id } }
    );

    if (updated.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Referral code could not be claimed" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, referredByUserId: referrer._id });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
