import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB, CliSession, User } from "@/lib/db";

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

  const user = await User.findOne({ clerkId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  session.userId = user._id;
  session.status = "confirmed";
  await session.save();

  return NextResponse.json({ success: true });
}
