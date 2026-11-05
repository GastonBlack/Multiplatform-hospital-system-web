import Link from "next/link";
import { Hospital } from "lucide-react";
import { getValidatedSession } from "@/features/auth/api.server";
import { readToken } from "@/lib/auth/session.server";
import { ApiError } from "@/lib/api/errors";
import { AccountOptions } from "./account-options";
import { isActiveAdmin } from "@/lib/auth/policy";

export async function SiteHeader() {
  let authenticated = false;
  let canAdmin = false;
  let unavailable = false;
  try {
    const session = await getValidatedSession(await readToken());
    authenticated = !!session;
    canAdmin = isActiveAdmin(session);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    unavailable = true;
  }

  const navigationLink =
    "relative inline-flex min-h-10 items-center justify-center whitespace-nowrap px-3 font-semibold text-[#242424] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4/5 after:-translate-x-1/2 after:scale-x-0 after:bg-[#142375] after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100";

  return (
    <header className="relative z-10 mx-auto w-[calc(100%-32px)] rounded-b-sm border border-t-0 border-[#e7e9ee] bg-white px-4 shadow-[0_8px_24px_rgba(36,36,36,0.12)] lg:w-[70%] lg:px-6">
      <div className="grid min-h-[88px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <Link
          href="/"
          aria-label="MHS home"
          className="flex w-fit items-center gap-2.5 text-xl font-extrabold tracking-[-0.03em] text-[#242424]"
        >
          <Hospital
            aria-hidden="true"
            className="size-10 shrink-0 fill-[#142375] text-white"
          />
          <span>
            MHS
            <small className="block text-[10px] font-normal tracking-normal text-[#626a78] max-[1280px]:hidden">
              Multiplatform Hospital System
            </small>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="col-span-full row-start-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <Link href="/" className={`${navigationLink} text-lg font-bold`}>
            Home
          </Link>
          <button type="button" disabled title="Coming soon" className={`${navigationLink} cursor-not-allowed text-sm opacity-60`}>
            Book an appointment
          </button>
          <button type="button" disabled title="Coming soon" className={`${navigationLink} cursor-not-allowed text-sm opacity-60`}>
            Medical history
          </button>
        </nav>
        <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-1 text-xs lg:col-start-3">
          {unavailable ? (
            <p role="status" className="text-xs text-[#626a78]">
              Account unavailable
            </p>
          ) : authenticated ? (
            <AccountOptions canAdmin={canAdmin} />
          ) : (
            <>
              <Link href="/login" className={navigationLink}>
                Sign in
              </Link>
              <Link href="/register" className={navigationLink}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
