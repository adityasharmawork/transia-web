import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Project, generateApiKey } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { id } = await params;
    const { fullKey, hash, prefix } = generateApiKey();

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: user._id },
      { apiKeyHash: hash, apiKeyPrefix: prefix },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Return the full API key only at regeneration time
    return NextResponse.json({ apiKey: fullKey });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
