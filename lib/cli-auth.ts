import { NextResponse } from "next/server";
import { connectDB, CliToken, hashToken, User, type IUser } from "@/lib/db";

/**
 * Authenticate a request using a CLI token (Bearer trn_cli_*).
 * Returns the User document or a 401 response.
 */
export async function requireCliUser(
  req: Request,
): Promise<IUser | NextResponse> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer trn_cli_")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  await connectDB();

  const tokenDoc = await CliToken.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) {
    return NextResponse.json(
      { error: "Token invalid or expired" },
      { status: 401 },
    );
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  return user;
}

/**
 * Type guard: returns true if the value is a NextResponse (auth failure).
 */
export function isAuthError(
  result: IUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
