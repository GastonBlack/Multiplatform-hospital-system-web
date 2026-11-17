"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { logoutOnThisDeviceAction } from "../actions";
import type { FormState } from "../types";

export function UnavailableAccount() {
  const [, action, pending] = useActionState<FormState>(
    logoutOnThisDeviceAction,
    {},
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p role="status" className="text-xs text-[#626a78]">
        Account unavailable
      </p>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          title="Sign out on this device"
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut aria-hidden="true" size={16} />
          {pending ? "Signing out..." : "Logout"}
        </button>
      </form>
    </div>
  );
}
