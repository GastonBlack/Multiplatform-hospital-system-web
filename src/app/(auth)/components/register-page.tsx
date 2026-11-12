import { RegisterForm } from "./register-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function RegisterPageView({ today }: { today: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5fafc] px-4 py-6 font-sans text-[#242424] selection:bg-[#d9f0fa] selection:text-[#286780]">
      <section className="flex w-full max-w-3xl flex-col rounded-lg border border-[#eceef3] bg-white p-5 shadow-[0_0_40px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.06)] sm:p-7">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex items-center gap-1 self-start text-[11px] font-medium text-[#626a78] hover:text-[#142375] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#142375]"
        >
          <ChevronLeft aria-hidden="true" size={17} strokeWidth={1.8} />
          Home
        </Link>
        <RegisterForm today={today} />
      </section>
    </div>
  );
}
