"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { getEmployeeDetailsAction } from "../admin/employee-details-action";
import {
  EmployeeDetailsDialog,
  type EmployeeDetailsResult,
} from "./employee-details-dialog";
import {
  accountStatusBackgrounds,
  accountStatusLabels,
} from "./employee-directory-statuses";
import { EmployeePagination } from "./employee-pagination";

interface EmployeeTableProps {
  section: DirectorySection;
  data: DirectoryState["data"];
  pending: boolean;
  onPage: (page: number) => void;
}

export function EmployeeTable({
  section,
  data,
  pending,
  onPage,
}: EmployeeTableProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<EmployeeDetailsResult | null>(null);
  const [detailsPending, startDetailsTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (details && dialog && !dialog.open) dialog.showModal();
  }, [details]);

  function viewDetails(profileId: string) {
    if (pending || detailsPending || dialogRef.current?.open) return;
    startDetailsTransition(async () => {
      const result = await getEmployeeDetailsAction(section, profileId).catch(
        () => ({ message: "Something went wrong. Please try again." }),
      );
      setDetails(result);
    });
  }

  const doctors = section === "doctors";
  const title = doctors ? "Doctors" : "Staff";
  const columns = [
    "Name",
    "Email",
    "National ID",
    "Employee number",
    doctors ? "Medical license number" : "Role",
    "Status",
    "Actions",
  ];

  return (
    <div
      aria-busy={pending || detailsPending}
      className={`overflow-hidden rounded-xl border border-[#c8d2e2] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.05)] ${pending ? "opacity-60" : ""}`}
    >
      <h2 className="border-b border-[#c8d2e2] px-5 py-4 text-sm font-semibold text-[#243754]">
        Results
      </h2>
      <EmployeeDetailsDialog
        dialogRef={dialogRef}
        result={details}
        onClose={() => {
          if (!dialogRef.current?.open) setDetails(null);
        }}
      />
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
            {data?.items.map((item) => {
              const profileId = "doctorId" in item ? item.doctorId : item.staffId;
              return (
                <tr
                  key={profileId}
                  onClick={(event) => {
                    if (pending || detailsPending) return;
                    event.currentTarget.querySelector("button")?.focus();
                    void viewDetails(profileId);
                  }}
                  className="cursor-pointer border-b border-[#dfe5ef] even:bg-[#f5f7fb] last:border-b-0 hover:bg-[#e8eef7] even:hover:bg-[#e8eef7] motion-safe:scale-100 motion-safe:transition-[scale,background-color] motion-safe:duration-150 motion-safe:hover:scale-[1_1.01]"
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
                    {item.nationalIdentificationNumber ?? "—"}
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
                      className={`rounded-full px-2.5 py-1 text-[11px] text-[#242424] ${accountStatusBackgrounds[item.accountStatus]}`}
                    >
                      {accountStatusLabels[item.accountStatus]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-label={`View details for ${item.firstName} ${item.lastName}`}
                      disabled={pending}
                      aria-disabled={detailsPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        void viewDetails(profileId);
                      }}
                      className="cursor-pointer rounded-md bg-[#e5ecf6] px-3 py-2 font-semibold text-[#243754] hover:bg-[#dce7f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142375] disabled:cursor-wait aria-disabled:cursor-wait"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              );
            })}
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
      <EmployeePagination
        section={section}
        data={data}
        pending={pending}
        onPage={onPage}
      />
    </div>
  );
}
