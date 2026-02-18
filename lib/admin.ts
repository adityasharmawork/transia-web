import { requireUser } from "@/lib/auth";
import type { IUser } from "@/lib/db";

function parseCsv(value: string | undefined, normalize = false): Set<string> {
  if (!value) return new Set();
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!normalize) return new Set(items);
  return new Set(items.map((item) => item.toLowerCase()));
}

export function isAdminUser(user: IUser): boolean {
  const adminClerkIds = parseCsv(process.env.BILLING_ADMIN_CLERK_IDS);
  const adminEmails = parseCsv(process.env.BILLING_ADMIN_EMAILS, true);
  return (
    adminClerkIds.has(user.clerkId) ||
    adminEmails.has(user.email.toLowerCase())
  );
}

export async function requireAdminUser(): Promise<IUser> {
  const user = await requireUser();
  if (!isAdminUser(user)) {
    throw new Error("Forbidden");
  }
  return user;
}
