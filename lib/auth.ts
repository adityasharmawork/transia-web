import { auth } from "@clerk/nextjs/server";
import { connectDB, User, type IUser } from "@/lib/db";

export async function getCurrentUser(): Promise<IUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();
  return User.findOne({ clerkId: userId });
}

export async function requireUser(): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
