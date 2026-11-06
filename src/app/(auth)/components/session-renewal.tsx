"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { renewSessionAction } from "../session/refresh/actions";

export function SessionRenewal({ returnTo }: { returnTo: string }) {
  const [message, setMessage] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function renew() {
      if (!navigator.locks) {
        if (active)
          setMessage(
            "Your browser cannot safely restore this session. Please sign in again.",
          );
        return;
      }
      try {
        // Serialize rotating-token requests across tabs. Recheck cookies inside the action.
        await navigator.locks.request("mhs-session-renewal", async () => {
          if (!active) return;
          const result = await renewSessionAction();
          if (!active) return;
          if (result.status === "error") setMessage(result.message);
          else
            window.location.replace(
              result.status === "ready" || returnTo.startsWith("/admin")
                ? returnTo
                : "/login?expired=1",
            );
        });
      } catch {
        if (active)
          setMessage("Unable to renew your session. Please try again.");
      }
    }
    void renew();
    return () => {
      active = false;
    };
  }, [returnTo, attempt]);

  return (
    <section className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 px-6 text-center text-sm text-[#363636]">
      {message ? (
        <>
          <p role="alert">{message}</p>
          <button
            className="cursor-pointer bg-[#142375] px-4 py-3 font-bold text-white"
            onClick={() => {
              setMessage(undefined);
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
          <Link href="/login" className="font-semibold text-[#142375]">
            Sign in
          </Link>
        </>
      ) : (
        <p role="status">Restoring your session...</p>
      )}
    </section>
  );
}
