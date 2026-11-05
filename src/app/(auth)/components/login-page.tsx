import { LoginForm } from "./login-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function LoginPageView({ expired }: { expired: boolean }) {
  return (
    <div className="min-h-svh bg-[#e4e4e4] flex items-center justify-center px-4 pt-4 pb-[calc(16px+10svh)] font-sans selection:bg-[#1e4d30] selection:text-white">
      <div className="w-full max-w-xl flex flex-col overflow-hidden rounded-sm bg-white p-6 shadow-[0_12px_36px_rgba(36,36,36,0.14),0_2px_8px_rgba(36,36,36,0.06)]">
        {/* Back link */}
        <div className="flex items-center bg-white">
          <Link
            href="/"
            aria-label="Back to home"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#242424] hover:scale-115 transition-all transition-01s"
          >
            <ChevronLeft aria-hidden="true" size={24} />
          </Link>
        </div>

        {expired && (
          <p
            role="status"
            className="mx-4 mt-3 rounded-md border border-[#1e4d30]/20 bg-white px-3 py-2.5 text-xs text-[#1e4d30] font-medium shadow-sm"
          >
            Your session has expired. Please sign in again.
          </p>
        )}

        <h1 className="sr-only">Sign in</h1>

        {/* Auth Card */}
        <LoginForm />
      </div>
    </div>
  );
}
