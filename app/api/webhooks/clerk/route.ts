import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB, User } from "@/lib/db";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // M5: Verify timestamp freshness (within 5 minutes)
  const timestampSec = parseInt(svixTimestamp, 10);
  const nowSec = Math.floor(Date.now() / 1000);
  if (isNaN(timestampSec) || Math.abs(nowSec - timestampSec) > 300) {
    return NextResponse.json(
      { error: "Webhook timestamp too old or invalid" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address;
    const name =
      [first_name, last_name].filter(Boolean).join(" ") || "User";

    await User.findOneAndUpdate(
      { clerkId: id },
      { clerkId: id, email, name },
      { upsert: true, new: true }
    );
  }

  if (event.type === "user.deleted") {
    await User.findOneAndDelete({ clerkId: event.data.id });
  }

  return NextResponse.json({ success: true });
}
