"use client";

import { useId, useRef, type ReactNode, type RefObject } from "react";
import { Pencil, UserRound, X } from "lucide-react";
import type { getEmployeeDetailsAction } from "../admin/employee-details-action";
import {
  accountStatusBackgrounds,
  accountStatusLabels,
} from "./employee-directory-statuses";

export type EmployeeDetailsResult = Awaited<
  ReturnType<typeof getEmployeeDetailsAction>
>;

function isOutside(dialog: HTMLDialogElement, x: number, y: number) {
  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  return x < left || x > right || y < top || y > bottom;
}

export function EmployeeDetailsDialog({
  dialogRef,
  result,
  onClose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  result: EmployeeDetailsResult | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const pressedOutside = useRef(false);
  const employee = result?.data;
  const fields: (readonly [string, ReactNode])[] = employee
    ? [
        ["First name", employee.firstName],
        ["Last name", employee.lastName],
        ["Email", employee.email],
        ["National ID", employee.nationalIdentificationNumber ?? "—"],
        ["Employee number", employee.employeeNumber],
        [
          "Status",
          <span
            key="status"
            className={`inline-block rounded-full px-2.5 py-1 text-xs text-[#242424] ${accountStatusBackgrounds[employee.accountStatus]}`}
          >
            {accountStatusLabels[employee.accountStatus]}
          </span>,
        ],
        ...("doctorId" in employee
          ? [
              ["Medical license number", employee.medicalLicenseNumber],
              ["Doctor ID", employee.doctorId],
            ] as const
          : [
              ["Role", employee.staffRole],
              ["Staff ID", employee.staffId],
            ] as const),
        ["User ID", employee.userId],
      ]
    : [];

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: "any" }}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl border border-[#c8d2e2] bg-white p-0 text-[#242424] shadow-[0_12px_40px_rgba(0,0,0,0.13)] backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-black/35 [&:modal]:overscroll-contain"
      onClose={onClose}
      onPointerDown={({ currentTarget, clientX, clientY }) => {
        pressedOutside.current =
          !("closedBy" in HTMLDialogElement.prototype) &&
          isOutside(currentTarget, clientX, clientY);
      }}
      onPointerUp={({ currentTarget, clientX, clientY }) => {
        if (
          pressedOutside.current &&
          isOutside(currentTarget, clientX, clientY)
        ) {
          currentTarget.close();
        }
        pressedOutside.current = false;
      }}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#dce2ec] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef1fb] text-[#142375]">
            <UserRound size={18} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h2 id={titleId} className="text-base font-semibold text-[#243754]">
            Employee details
          </h2>
        </div>
        <form method="dialog">
          <button
            type="submit"
            aria-label="Close details"
            className="grid size-9 cursor-pointer place-items-center rounded-md text-[#243754] hover:bg-[#dce7f6]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </form>
      </header>
      <div className="bg-[#f5f7fb] p-5">
        {result?.message && (
          <p role="alert" className="text-sm text-red-700">{result.message}</p>
        )}
        {employee && (
          <dl className="grid gap-3 text-sm min-[420px]:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg border border-[#dce2ec] bg-white px-3 py-2.5">
                <dt className="text-xs font-semibold text-[#536078]">{label}</dt>
                <dd className="mt-1 wrap-break-word font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <form method="dialog" className="flex justify-end gap-2 border-t border-[#dce2ec] px-5 py-4">
        <button
          type="button"
          disabled
          title="Editing is not available yet."
          className="inline-flex min-h-9 cursor-not-allowed items-center gap-2 rounded-md border border-[#d7deea] bg-[#f6f8fb] px-4 text-xs font-medium text-[#626a78] opacity-60"
        >
          <Pencil size={14} aria-hidden="true" />
          Edit
        </button>
        <button
          type="submit"
          className="min-h-9 cursor-pointer rounded-md bg-[#142375] px-4 text-xs font-semibold text-white hover:bg-[#243889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142375]"
        >
          Close
        </button>
      </form>
    </dialog>
  );
}
