"use client";

import {
  ArrowLeft,
  Pencil,
  Plus,
  Stethoscope,
  Trash2,
  UsersRound,
} from "lucide-react";
import type { DirectorySection } from "@/features/admin/types";

interface EmployeeHeaderProps {
  section: DirectorySection;
  registrationOpen: boolean;
  pending: boolean;
  onToggle: () => void;
}

export function EmployeeHeader({
  section,
  registrationOpen,
  pending,
  onToggle,
}: EmployeeHeaderProps) {
  const doctors = section === "doctors";
  const title = doctors ? "Doctors" : "Staff";
  const Icon = doctors ? Stethoscope : UsersRound;
  return (
    <div className="rounded-xl border border-[#d8dfeb] bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.04)] sm:p-5">
      <header className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eef1fb] text-[#142375]">
          <Icon aria-hidden="true" size={24} strokeWidth={1.6} />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h1>
      </header>

      <div
        aria-label={`${title} actions`}
        className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#dce2ec] pt-4"
      >
        <button
          type="button"
          disabled={!doctors || pending}
          onClick={onToggle}
          aria-expanded={doctors ? registrationOpen : undefined}
          aria-controls={doctors ? "doctor-registration" : undefined}
          title={
            !doctors ? "Staff registration is not available yet." : undefined
          }
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-[#142375] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#243889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142375] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registrationOpen ? (
            <ArrowLeft aria-hidden="true" size={16} />
          ) : (
            <Plus aria-hidden="true" size={16} />
          )}
          {registrationOpen
            ? "Back to doctors"
            : doctors
              ? "Add doctor"
              : "Add staff member"}
        </button>
        {!registrationOpen && (
          <>
            <button
              type="button"
              disabled
              title="Editing is not available yet."
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d7deea] bg-[#f6f8fb] px-4 text-xs font-medium text-[#626a78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil aria-hidden="true" size={15} />
              Edit
            </button>
            <button
              type="button"
              disabled
              title="Deletion is not available yet."
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d7deea] bg-[#f6f8fb] px-4 text-xs font-medium text-[#626a78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 aria-hidden="true" size={15} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
