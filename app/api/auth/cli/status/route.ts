import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB, CliSession, CliToken, hashToken, User } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionToken = searchParams.get("session");

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Missing session parameter" },
      { status: 400 }
    );
  }

  // Throttle polling to slow brute-force attempts (C4)
  await new Promise((resolve) => setTimeout(resolve, 500));

  await connectDB();

  const session = await CliSession.findOne({ sessionToken });

  if (!session) {
    return NextResponse.json({ status: "expired" });
  }

  if (session.status === "confirmed" && session.userId) {
    const user = await User.findById(session.userId);

    // Generate auth token at pickup time — never stored in session
    const authToken = `trn_cli_${crypto.randomBytes(32).toString("hex")}`;

    // Store only the hash for future verification
    await CliToken.create({
      userId: user!._id,
      tokenHash: hashToken(authToken),
    });

    // Delete session immediately — token can only be retrieved once
    await CliSession.deleteOne({ _id: session._id });

    return NextResponse.json({
      status: "confirmed",
      authToken,
      email: user?.email ?? "",
    });
  }

  return NextResponse.json({ status: session.status });
}
