import { NextResponse } from "next/server";
import { connectDB, CliSession } from "@/lib/db";

export async function POST() {
  await connectDB();

  const session = await CliSession.create({});

  return NextResponse.json({
    sessionToken: session.sessionToken,
  });
}
