import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, CliToken } from "@/lib/db";

// List all active tokens for the current user
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const tokens = await CliToken.find({
      userId: user._id,
      expiresAt: { $gt: new Date() },
    })
      .select("_id label createdAt expiresAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tokens });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Revoke a specific token
export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { tokenId } = await req.json();

    if (!tokenId || typeof tokenId !== "string") {
      return NextResponse.json({ error: "Missing tokenId" }, { status: 400 });
    }

    await connectDB();

    const result = await CliToken.deleteOne({
      _id: tokenId,
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
