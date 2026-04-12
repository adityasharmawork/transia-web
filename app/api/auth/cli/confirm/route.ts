import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB, CliSession, User } from "@/lib/db";
import { ensureUserReferralCode } from "@/lib/referrals";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionToken } = await req.json();
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Missing sessionToken" },
      { status: 400 }
    );
  }

  await connectDB();

  let user = await User.findOne({ clerkId });

  // Auto-create user if not in DB (handles cases where the Clerk webhook
  // hasn't fired yet, e.g. local development without webhook tunnel)
  if (!user) {
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(clerkId);
      const email =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";

      if (!email) {
        return NextResponse.json({ error: "No email found for user" }, { status: 400 });
      }

      user = await User.findOneAndUpdate(
        { clerkId },
        {
          $setOnInsert: {
            clerkId,
            email,
            name:
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
              email.split("@")[0],
            tier: "free",
          },
        },
        { upsert: true, new: true }
      );

      // Generate referral code for the new user
      await ensureUserReferralCode(user!._id).catch(() => {});
    } catch (error) {
      console.error("Failed to auto-create user:", error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }

  const session = await CliSession.findOne({
    sessionToken,
    status: "pending",
  });

  if (!session) {
    return NextResponse.json(
      { error: "Session not found or expired" },
      { status: 404 }
    );
  }

  // Mark session as confirmed — token is generated when CLI polls /status
  session.userId = user!._id;
  session.status = "confirmed";
  await session.save();

  return NextResponse.json({ success: true });
}
