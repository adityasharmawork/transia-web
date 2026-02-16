import { NextResponse } from "next/server";
import { connectDB, CliToken, hashToken, User } from "@/lib/db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer trn_cli_")) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  await connectDB();

  const tokenDoc = await CliToken.findOne({ tokenHash: hashToken(token) });
  if (!tokenDoc) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, email: user.email });
}
