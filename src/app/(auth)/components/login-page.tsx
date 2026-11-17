import { LoginForm } from "./login-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UnavailableAccount } from "./unavailable-account";

export function LoginPageView({
  expired,
  unavailable = false,
}: {
  expired: boolean;
  unavailable?: boolean;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5fafc] px-4 pt-6 pb-[calc(24px+10svh)] font-sans text-[#242424] selection:bg-[#d9f0fa] selection:text-[#286780]">
      <div className="flex w-full max-w-xl flex-col rounded-lg border border-[#eceef3] bg-white p-5 shadow-[0_0_40px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.06)] sm:p-7">
        {/* Back link */}
        <div className="flex items-center bg-white">
          <Link
            href="/"
            aria-label="Back to home"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#626a78] hover:text-[#142375] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#142375]"
          >
            <ChevronLeft aria-hidden="true" size={17} strokeWidth={1.8} />
            Home
          </Link>
        </div>

        {expired && (
          <p
            role="status"
            className="mt-5 border-l-2 border-[#142375] bg-[#f3f5fc] px-4 py-3 text-xs leading-5 text-[#536078]"
          >
            Your session has expired. Please sign in again.
          </p>
        )}

        {/* Auth Card */}
        {unavailable ? (
          <div className="px-2 py-7 sm:px-8">
            <h1 className="mb-4 text-xl font-medium">Sign in</h1>
            <p className="mb-4 text-sm leading-6 text-[#626a78]">
              Unable to verify your current session. Try again later or sign out
              on this device to sign in again.
            </p>
            <UnavailableAccount />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
