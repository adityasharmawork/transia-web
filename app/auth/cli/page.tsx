"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function CliAuthContent() {
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get("session");
  const { isSignedIn, isLoaded } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "confirming" | "success" | "error"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!sessionToken) {
      setStatus("error");
      setErrorMsg("Missing session token. Please run `transia login` again.");
      return;
    }

    if (!isSignedIn) {
      // Redirect to sign-in with a return URL
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/auth/cli?session=${sessionToken}`)}`;
      return;
    }

    confirmSession();
  }, [isLoaded, isSignedIn, sessionToken]);

  async function confirmSession() {
    setStatus("confirming");
    try {
      const res = await fetch("/api/auth/cli/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMsg(data.error || "Failed to confirm session.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <h1 className="font-mono text-base font-medium tracking-[0.1em] text-[var(--foreground)]">
        transia
      </h1>

      {status === "loading" && (
        <div className="mt-6">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      )}

      {status === "confirming" && (
        <div className="mt-6">
          <p className="text-[var(--text-secondary)]">
            Confirming your CLI session...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--terminal-green)]/10">
            <span className="text-2xl text-[var(--terminal-green)]">
              &#10003;
            </span>
          </div>
          <h2 className="text-lg font-medium text-[var(--foreground)]">
            CLI Authenticated
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            You can close this window and return to your terminal.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--terminal-red)]/10">
            <span className="text-2xl text-[var(--terminal-red)]">
              &#10007;
            </span>
          </div>
          <h2 className="text-lg font-medium text-[var(--foreground)]">
            Authentication Failed
          </h2>
          <p className="mt-2 text-sm text-[var(--terminal-red)]">
            {errorMsg}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h1 className="font-mono text-base font-medium tracking-[0.1em] text-[var(--foreground)]">
              transia
            </h1>
            <div className="mt-6">
              <p className="text-[var(--text-secondary)]">Loading...</p>
            </div>
          </div>
        }
      >
        <CliAuthContent />
      </Suspense>
    </div>
  );
}
