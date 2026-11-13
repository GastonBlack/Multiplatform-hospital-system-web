"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UsersRound,
} from "lucide-react";
import { DoctorRegistrationForm } from "./doctor-registration-form";
import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { directoryHref, directoryPages } from "../admin/directory-query";

export function EmployeeManagement({
  section,
  directory,
}: {
  section: DirectorySection;
  directory: DirectoryState;
}) {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { data, query, errors, message } = directory;
  const doctors = section === "doctors";
  const title = doctors ? "Doctors" : "Staff";
  const Icon = doctors ? Stethoscope : UsersRound;
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
  const columns = [
    "Name",
    "Email",
    "National ID",
    "Employee number",
    doctors ? "Medical license number" : "Role",
    "Status",
  ];
  const statuses = {
    PendingVerification: "Pending verification",
    Active: "Active",
    Suspended: "Suspended",
    Deactivated: "Deactivated",
  };
  const pages = data ? directoryPages(data.page, data.totalPages) : [];
  function goToPage(page: number) {
    startTransition(() =>
      router.push(directoryHref(section, query, page), { scroll: false }),
    );
  }

  return (
    <section className="mx-auto max-w-[1280px] rounded-2xl border border-[#dce2ec] bg-[#f2f4f8] p-3 text-[#242424] sm:p-6">
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
            onClick={() => {
              if (registrationOpen) startTransition(() => router.refresh());
              setRegistrationOpen((open) => !open);
            }}
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

      {registrationOpen ? (
        <div
          id="doctor-registration"
          className="mt-5 rounded-xl border border-[#d1dbe9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6"
        >
          <DoctorRegistrationForm />
        </div>
      ) : (
        <>
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
              startTransition(() =>
                router.push(directoryHref(section, filters), { scroll: false }),
              );
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
                      name === "nationalIdentificationNumber"
                        ? "numeric"
                        : undefined
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
                    <p
                      id="staff-role-error"
                      className="mt-1 text-xs text-red-700"
                    >
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
                    errors?.accountStatus
                      ? `${section}-status-error`
                      : undefined
                  }
                  className="h-10 w-full rounded-md border border-[#bdcada] bg-white px-3 text-xs text-[#465773] focus-visible:outline-2 focus-visible:outline-[#5d82b4]"
                >
                  <option value="">All statuses</option>
                  {Object.entries(statuses).map(([value, label]) => (
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
                    startTransition(() =>
                      router.push(directoryHref(section, {}), {
                        scroll: false,
                      }),
                    );
                  }}
                  className="min-h-9 cursor-pointer rounded-md px-3 text-xs font-medium text-[#465773] hover:bg-[#dce6f3] disabled:cursor-wait disabled:opacity-60"
                >
                  Clear filters
                </button>
              </div>
            </fieldset>
          </form>

          {message && (
            <div
              role="alert"
              className="mb-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <p>{message}</p>
              {errors?.page && <p>Page: {errors.page.join(" ")}</p>}
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => router.refresh())}
                className="mt-2 cursor-pointer font-semibold underline underline-offset-4 disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          )}

          <div
            aria-busy={pending}
            className={`overflow-hidden rounded-xl border border-[#c8d2e2] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.05)] ${pending ? "opacity-60" : ""}`}
          >
            <h2 className="border-b border-[#c8d2e2] px-5 py-4 text-sm font-semibold text-[#243754]">
              Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                <caption className="sr-only">{title} directory</caption>
                <thead className="border-b border-[#c8d2e2] bg-[#e5ecf6] text-[#344863]">
                  <tr>
                    <th scope="col" className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        disabled
                        aria-label={`Select all ${doctors ? "doctors" : "staff members"}`}
                        className="size-3.5 cursor-not-allowed"
                      />
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap px-4 py-4 font-semibold"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((item) => (
                    <tr
                      key={"doctorId" in item ? item.doctorId : item.staffId}
                      className="border-b border-[#dfe5ef] even:bg-[#f5f7fb] last:border-b-0 hover:bg-[#edf3fa]"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          disabled
                          aria-label={`Select ${item.firstName} ${item.lastName}`}
                          className="size-3.5 cursor-not-allowed"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-[#242424]">
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="px-4 py-4 text-[#536078]">{item.email}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#536078]">
                        {item.nationalIdentificationNumber ?? "Not provided"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#536078]">
                        {item.employeeNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#536078]">
                        {"medicalLicenseNumber" in item
                          ? item.medicalLicenseNumber
                          : item.staffRole}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] ${item.accountStatus === "Active" ? "bg-[#f0f7f3] text-[#32654b]" : "bg-[#f1f3f7] text-[#626a78]"}`}
                        >
                          {statuses[item.accountStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-6 py-16 text-center text-[#626a78]"
                      >
                        <p role="status">
                          {data
                            ? `No ${doctors ? "doctors" : "staff members"} match your filters.`
                            : "Unable to load the directory."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <nav
              aria-label={`${title} pagination`}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ccd6e5] bg-[#f3f6fb] px-4 py-3 text-xs text-[#465773]"
            >
              <span>
                {data
                  ? `${data.totalCount} results · ${data.pageSize} per page`
                  : "25 per page"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    pending || !data || data.page <= 1 || data.totalPages === 0
                  }
                  onClick={() =>
                    data && goToPage(Math.min(data.page - 1, data.totalPages))
                  }
                  aria-label="Previous page"
                  className="grid size-8 place-items-center rounded disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft aria-hidden="true" size={16} />
                </button>
                {pages.map((page, index) => (
                  <span key={page} className="inline-flex items-center gap-2">
                    {index > 0 && page > pages[index - 1] + 1 && (
                      <span aria-hidden="true">…</span>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={`Page ${page}`}
                      aria-current={data?.page === page ? "page" : undefined}
                      onClick={() => goToPage(page)}
                      className={`grid size-8 cursor-pointer place-items-center rounded-md ${data?.page === page ? "bg-[#142375] font-semibold text-white shadow-sm" : "hover:bg-[#e1e8f3]"} disabled:opacity-50`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
                {data && data.totalPages > 0 && (
                  <span className="sr-only">
                    Page {data.page} of {data.totalPages}
                  </span>
                )}
                <button
                  type="button"
                  disabled={pending || !data || data.page >= data.totalPages}
                  onClick={() => data && goToPage(data.page + 1)}
                  aria-label="Next page"
                  className="grid size-8 place-items-center rounded disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </section>
  );
}
