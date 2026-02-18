import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

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

// Tier changes are handled exclusively via Stripe webhooks.
// See /api/webhooks/stripe for the implementation.
export async function POST() {
  return NextResponse.json(
    { error: "Tier changes are managed through billing. Visit /dashboard/billing to upgrade." },
    { status: 403 }
  );
}
