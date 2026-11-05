"use client";

import { useActionState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, UserRound, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

export function AccountOptions({ canAdmin }: { canAdmin: boolean }) {
  const [state, action, pending] = useActionState(logoutAction, {});
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const dropdown = dropdownRef.current;
      if (dropdown?.open && event.target instanceof Node && !dropdown.contains(event.target)) {
        dropdown.open = false;
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      const dropdown = dropdownRef.current;
      if (dropdown?.open && event.key === "Escape") {
        dropdown.open = false;
        dropdown.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOutside, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details ref={dropdownRef} className="group relative">
      <summary className="relative flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 text-xs font-semibold text-[#242424] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4/5 after:-translate-x-1/2 after:scale-x-0 after:bg-[#142375] after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100 group-open:after:scale-x-100 [&::-webkit-details-marker]:hidden">
        Options{" "}
        <ChevronDown
          aria-hidden="true"
          size={14}
          className="transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-sm border border-[#e7e9ee] bg-white p-2 shadow-lg">
        <a
          href="/perfil"
          className="relative flex min-h-10 items-center gap-2 px-3 text-xs font-semibold text-[#242424] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4/5 after:-translate-x-1/2 after:scale-x-0 after:bg-[#142375] after:transition-transform hover:bg-[#f6f7fb] hover:after:scale-x-100 focus-visible:after:scale-x-100"
        >
          <UserRound aria-hidden="true" size={16} /> My profile
        </a>
        {canAdmin && (
          <a href="/admin" className="relative flex min-h-10 items-center gap-2 px-3 text-xs font-semibold text-[#242424] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4/5 after:-translate-x-1/2 after:scale-x-0 after:bg-[#142375] after:transition-transform hover:bg-[#f6f7fb] hover:after:scale-x-100 focus-visible:after:scale-x-100">
            <ShieldCheck aria-hidden="true" size={16} /> Go to admin panel
          </a>
        )}
        <form action={action}>
          <button
            disabled={pending}
            className="relative flex min-h-10 w-full cursor-pointer items-center gap-2 px-3 text-left text-xs font-bold text-red-700 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4/5 after:-translate-x-1/2 after:scale-x-0 after:bg-[#142375] after:transition-transform hover:bg-red-50 hover:after:scale-x-100 focus-visible:after:scale-x-100 disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut aria-hidden="true" size={16} />{" "}
            {pending ? "Signing out..." : "Logout"}
          </button>
          {state.message && (
            <p
              role="alert"
              className="px-3 py-2 text-xs leading-5 text-red-700"
            >
              {state.message}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}
