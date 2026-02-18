import { NextResponse } from "next/server";
import { connectDB, CliSession } from "@/lib/db";
import { authInitLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit by client IP
  const rateLimited = await checkRateLimit(authInitLimiter, getClientIp(req));
  if (rateLimited) return rateLimited;

  await connectDB();

  const session = await CliSession.create({});

  return NextResponse.json({
    sessionToken: session.sessionToken,
  });
}
