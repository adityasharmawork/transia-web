import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that don't require authentication.
// Everything NOT listed here will require Clerk auth by default (secure default-deny).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/auth/cli(.*)",
  // CLI auth endpoints (init, confirm, status) use their own token auth
  "/api/auth/cli/(.*)",
  // Translation API uses Bearer token auth, not Clerk
  "/api/translate",
  // Webhooks verify signatures themselves (Stripe HMAC, Clerk/Svix)
  "/api/webhooks/(.*)",
  // Widget analytics endpoint is public (rate-limited by IP)
  "/api/analytics/event",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API routes
    "/(api|trpc)(.*)",
  ],
};
