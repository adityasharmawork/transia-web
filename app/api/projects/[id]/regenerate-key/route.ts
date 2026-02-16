import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB, Project } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    await connectDB();

    const { id } = await params;
    const newApiKey = `trn_live_${crypto.randomBytes(24).toString("hex")}`;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: user._id },
      { apiKey: newApiKey },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiKey: project.apiKey });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
