import { NextResponse } from "next/server";
import { connectDB, CliToken, hashToken, Project, UsageLog } from "@/lib/db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer trn_cli_")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  await connectDB();

  const tokenDoc = await CliToken.findOne({ tokenHash: hashToken(token) });
  if (!tokenDoc) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectApiKey, stringsTranslated, tokensUsed, provider, locale } =
    body;

  // Find the project by API key if provided, otherwise log without project association
  let projectId = null;
  if (projectApiKey) {
    const project = await Project.findOne({ apiKey: projectApiKey });
    if (project) {
      projectId = project._id;
    }
  }

  if (projectId) {
    await UsageLog.create({
      projectId,
      stringsTranslated: stringsTranslated || 0,
      tokensUsed: tokensUsed || 0,
      provider: provider || "unknown",
      locale: locale || "unknown",
    });
  }

  return NextResponse.json({ success: true });
}
