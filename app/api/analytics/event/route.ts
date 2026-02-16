import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB, AnalyticsEvent, Project } from "@/lib/db";

const ALLOWED_EVENT_TYPES = new Set([
  "widget.loaded",
  "widget.language_selected",
]);

const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const MAX_BATCH_SIZE = 50;
const MAX_PAGE_URL_LENGTH = 2048;
const MONGO_ID_RE = /^[a-f0-9]{24}$/;
const API_KEY_RE = /^trn_live_[a-f0-9]{48}$/;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// H9: CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

interface WidgetEvent {
  projectId: string;
  eventType: string;
  locale: string;
  pageUrl: string;
}

export async function POST(req: Request) {
  try {
    const { events } = (await req.json()) as { events: WidgetEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Missing events array" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // H1: Reduce batch limit to 50
    const batch = events.slice(0, MAX_BATCH_SIZE);

    // H1: Validate event structure
    const validEvents = batch.filter((e) => {
      if (!e.projectId || typeof e.projectId !== "string") return false;
      // Validate projectId format (must be an API key format)
      if (!API_KEY_RE.test(e.projectId)) return false;
      // Validate eventType is one of the known types
      if (!ALLOWED_EVENT_TYPES.has(e.eventType)) return false;
      // M1: Validate locale format (allow empty)
      if (e.locale && !LOCALE_RE.test(e.locale)) return false;
      // M1: Validate pageUrl length
      if (e.pageUrl && (typeof e.pageUrl !== "string" || e.pageUrl.length > MAX_PAGE_URL_LENGTH)) return false;
      return true;
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: "No valid events in batch" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country") || "";
    const userAgent = headersList.get("user-agent") || "";

    await connectDB();

    // Look up project API keys to get project ObjectIds
    const projectIds = [...new Set(validEvents.map((e) => e.projectId))];
    const projects = await Project.find({
      apiKey: { $in: projectIds },
    }).lean();

    const projectMap = new Map(
      projects.map((p) => [p.apiKey, p._id])
    );

    const docs = validEvents
      .filter((e) => projectMap.has(e.projectId))
      .map((e) => ({
        projectId: projectMap.get(e.projectId)!,
        eventType: e.eventType,
        locale: e.locale || "",
        pageUrl: e.pageUrl || "",
        userAgent,
        country,
      }));

    if (docs.length > 0) {
      await AnalyticsEvent.insertMany(docs, { ordered: false });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Failed to process events" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
