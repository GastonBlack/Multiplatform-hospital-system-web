"use client";

import { useActionState } from "react";
import { logoutAction } from "../actions";

export function LogoutButton() {
  const [state, action, pending] = useActionState(logoutAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <button
        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[7px] border border-[#163f73] bg-[#163f73] px-[18px] py-[9px] font-bold text-white transition-colors hover:bg-[#10325b] disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {state.message && (
        <p role="alert">
          {state.message} Sign out could not be confirmed. Please try again.
        </p>
      )}
    </form>
  );
}
