import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, User } from "@/lib/db";

const VALID_TIERS = ["free", "pro", "team"] as const;

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      tier: user.tier,
      email: user.email,
      name: user.name,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { tier } = await req.json();

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be one of: free, pro, team" },
        { status: 400 }
      );
    }

    await connectDB();

    // TODO: When Stripe is integrated, verify payment before upgrading to pro/team.
    // For now, allow tier changes directly for MVP testing.
    await User.findByIdAndUpdate(user._id, { tier });

    return NextResponse.json({ success: true, tier });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
