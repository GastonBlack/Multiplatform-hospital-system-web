"use client";

import { Search } from "lucide-react";
import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { accountStatusLabels } from "./employee-directory-statuses";

interface EmployeeFiltersProps {
  section: DirectorySection;
  query: DirectoryState["query"];
  errors: DirectoryState["errors"];
  pending: boolean;
  onSearch: (filters: Record<string, string>) => void;
  onClear: () => void;
}

export function EmployeeFilters({
  section,
  query,
  errors,
  pending,
  onSearch,
  onClear,
}: EmployeeFiltersProps) {
  const doctors = section === "doctors";
  const title = doctors ? "Doctors" : "Staff";
  const filters = [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email", type: "text" },
    {
      name: "nationalIdentificationNumber",
      label: "National ID",
      type: "text",
    },
    { name: "employeeNumber", label: "Employee number", type: "text" },
    ...(doctors
      ? [
          {
            name: "medicalLicenseNumber",
            label: "Medical license number",
            type: "text",
          },
        ]
      : []),
  ];

  return (
    <form
      key={new URLSearchParams(query).toString()}
      aria-labelledby={`${section}-filters`}
      className="my-5 rounded-xl border border-[#cbd7e7] bg-[#eaf0f8] p-4 sm:p-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const filters: Record<string, string> = {};
        for (const [name, value] of new FormData(event.currentTarget)) {
          if (typeof value === "string") filters[name] = value;
        }
        onSearch(filters);
      }}
    >
      <h2
        id={`${section}-filters`}
        className="mb-5 border-b border-[#ccd7e7] pb-3 text-sm font-semibold text-[#243754]"
      >
        Filters
      </h2>
      <fieldset
        disabled={pending}
        className="grid grid-cols-3 gap-x-5 gap-y-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1"
      >
        <legend className="sr-only">{title} filters</legend>
        {filters.map(({ name, label, type }) => (
          <div key={name} className="min-w-0">
            <label
              htmlFor={`${section}-${name}`}
              className="mb-2 block text-xs font-medium text-[#465773]"
            >
              {label}
            </label>
            <input
              id={`${section}-${name}`}
              name={name}
              type={type}
              defaultValue={query[name] ?? ""}
              inputMode={
                name === "nationalIdentificationNumber" ? "numeric" : undefined
              }
              aria-invalid={!!errors?.[name]}
              aria-describedby={
                errors?.[name] ? `${section}-${name}-error` : undefined
              }
              className="h-10 w-full min-w-0 rounded-md border border-[#bdcada] bg-white px-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:border-[#5d82b4] focus:ring-2 focus:ring-[#cdddf2] disabled:opacity-70"
            />
            {errors?.[name] && (
              <p
                id={`${section}-${name}-error`}
                className="mt-1 text-xs text-red-700"
              >
                {errors[name].join(" ")}
              </p>
            )}
          </div>
        ))}
        {!doctors && (
          <div>
            <label
              htmlFor="staff-role"
              className="mb-2 block text-xs font-medium text-[#465773]"
            >
              Role
            </label>
            <select
              id="staff-role"
              name="staffRole"
              defaultValue={query.staffRole ?? ""}
              aria-invalid={!!errors?.staffRole}
              aria-describedby={
                errors?.staffRole ? "staff-role-error" : undefined
              }
              className="h-10 w-full rounded-md border border-[#bdcada] bg-white px-3 text-xs text-[#465773] focus-visible:outline-2 focus-visible:outline-[#5d82b4]"
            >
              <option value="">All roles</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Administrator">Administrator</option>
            </select>
            {errors?.staffRole && (
              <p id="staff-role-error" className="mt-1 text-xs text-red-700">
                {errors.staffRole.join(" ")}
              </p>
            )}
          </div>
        )}
        <div>
          <label
            htmlFor={`${section}-status`}
            className="mb-2 block text-xs font-medium text-[#465773]"
          >
            Status
          </label>
          <select
            id={`${section}-status`}
            name="accountStatus"
            defaultValue={query.accountStatus ?? ""}
            aria-invalid={!!errors?.accountStatus}
            aria-describedby={
              errors?.accountStatus ? `${section}-status-error` : undefined
            }
            className="h-10 w-full rounded-md border border-[#bdcada] bg-white px-3 text-xs text-[#465773] focus-visible:outline-2 focus-visible:outline-[#5d82b4]"
          >
            <option value="">All statuses</option>
            {Object.entries(accountStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors?.accountStatus && (
            <p
              id={`${section}-status-error`}
              className="mt-1 text-xs text-red-700"
            >
              {errors.accountStatus.join(" ")}
            </p>
          )}
        </div>
        <div className="col-span-full flex items-center gap-3 border-t border-[#ccd7e7] pt-4">
          <button
            type="submit"
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-[#aebfd9] bg-white px-4 text-xs font-semibold text-[#142375] shadow-sm hover:bg-[#f5f8fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142375] disabled:cursor-wait disabled:opacity-60"
          >
            <Search aria-hidden="true" size={15} />
            {pending ? "Loading..." : "Search"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.currentTarget.form?.reset();
              onClear();
            }}
            className="min-h-9 cursor-pointer rounded-md px-3 text-xs font-medium text-[#465773] hover:bg-[#dce6f3] disabled:cursor-wait disabled:opacity-60"
          >
            Clear filters
          </button>
        </div>
      </fieldset>
    </form>
  );
}
