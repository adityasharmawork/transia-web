import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { connectDB, AnalyticsEvent, Project } from "@/lib/db";
import { analyticsEventLimiter, getClientIp, checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_EVENT_TYPES = new Set([
  "widget.loaded",
  "widget.language_selected",
]);

const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const MAX_BATCH_SIZE = 50;
const MAX_PAGE_URL_LENGTH = 2048;
const PUBLIC_KEY_RE = /^trn_pub_[a-f0-9]{32}$/;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// SECURITY: strip query string and fragment so tokens / PII in URLs are never stored.
function stripPageUrl(raw: string): string {
  if (!raw) return "";
  return raw.split(/[?#]/)[0].slice(0, MAX_PAGE_URL_LENGTH);
}

// PRIVACY: coarse browser family instead of the full user-agent string.
function uaFamily(ua: string): string {
  if (!ua) return "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "other";
}

// CORS preflight handler
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
    const rateLimited = await checkRateLimit(analyticsEventLimiter, getClientIp(req));
    if (rateLimited) {
      const headers = corsHeaders();
      return new NextResponse(rateLimited.body, {
        status: 429,
        headers: { ...headers, "Retry-After": rateLimited.headers.get("Retry-After") || "60" },
      });
    }

    const origin = req.headers.get("origin") || "";
    const { events } = (await req.json()) as { events: WidgetEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Missing events array" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const batch = events.slice(0, MAX_BATCH_SIZE);

    const validEvents = batch.filter((e) => {
      if (!e.projectId || typeof e.projectId !== "string") return false;
      if (!PUBLIC_KEY_RE.test(e.projectId)) return false;
      if (!ALLOWED_EVENT_TYPES.has(e.eventType)) return false;
      if (e.locale && !LOCALE_RE.test(e.locale)) return false;
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
    const userAgent = uaFamily(headersList.get("user-agent") || "");

    await connectDB();

    const uniqueKeys = [...new Set(validEvents.map((e) => e.projectId))];
    const projects = await Project.find({
      publicKey: { $in: uniqueKeys },
    }).lean();

    // publicKey -> { id, allowedOrigins }. Projects with analytics disabled are excluded.
    const projectMap = new Map(
      projects
        .filter((p) => p.analyticsEnabled !== false)
        .map((p) => [p.publicKey, { id: p._id, allowedOrigins: p.allowedOrigins }])
    );

    // SECURITY: when a project configures an Origin allowlist, drop events whose
    // Origin is not on it (prevents other sites poisoning a customer's analytics).
    function originAllowed(allow?: string[]): boolean {
      if (!allow || allow.length === 0) return true;
      return allow.includes(origin);
    }

    const docs = validEvents
      .map((e) => ({ e, p: projectMap.get(e.projectId) }))
      .filter(({ p }) => p !== undefined && originAllowed(p!.allowedOrigins))
      .map(({ e, p }) => ({
        projectId: p!.id,
        eventType: e.eventType,
        locale: e.locale || "",
        pageUrl: stripPageUrl(e.pageUrl || ""),
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
