import { RegisterForm } from "./register-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function RegisterPageView({ today }: { today: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#e4e4e4] px-4 py-6 font-sans selection:bg-[#142375] selection:text-white">
      <section className="flex w-full max-w-3xl flex-col overflow-hidden rounded-sm bg-white p-6 shadow-[0_12px_36px_rgba(36,36,36,0.14),0_2px_8px_rgba(36,36,36,0.06)] max-[380px]:p-4">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex self-start text-[#242424] transition-transform hover:scale-110"
        >
          <ChevronLeft aria-hidden="true" size={24} />
        </Link>
        <h1 className="sr-only">Create account</h1>
        <RegisterForm today={today} />
      </section>
    </div>
  );
}
