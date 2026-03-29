import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB, CliSession, CliToken, hashToken, enforceTokenLimit, User } from "@/lib/db";

async function handleStatus(sessionToken: string | null) {
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Missing session parameter" },
      { status: 400 }
    );
  }

  // Throttle polling to slow brute-force attempts
  await new Promise((resolve) => setTimeout(resolve, 500));

  await connectDB();

  const session = await CliSession.findOne({ sessionToken });

  if (!session) {
    return NextResponse.json({ status: "expired" });
  }

  if (session.status === "confirmed" && session.userId) {
    const user = await User.findById(session.userId);

    // Enforce max 10 tokens per user — delete oldest if at limit
    await enforceTokenLimit(user!._id);

    // Generate auth token at pickup time — never stored in session
    const authToken = `trn_cli_${crypto.randomBytes(32).toString("hex")}`;

    // Store only the hash for future verification
    await CliToken.create({
      userId: user!._id,
      tokenHash: hashToken(authToken),
      label: "CLI",
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

// POST: session token in request body (secure — not logged by proxies/CDNs)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return handleStatus(body.session ?? null);
}

// GET removed — session tokens must not appear in URL query params
// (logged by proxies, CDNs, and browser history). Use POST instead.
