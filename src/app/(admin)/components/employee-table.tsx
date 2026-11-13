"use client";

import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { accountStatusLabels } from "./employee-directory-statuses";
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
  const doctors = section === "doctors";
  const title = doctors ? "Doctors" : "Staff";
  const columns = [
    "Name",
    "Email",
    "National ID",
    "Employee number",
    doctors ? "Medical license number" : "Role",
    "Status",
  ];

  return (
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
                    {accountStatusLabels[item.accountStatus]}
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
      <EmployeePagination
        section={section}
        data={data}
        pending={pending}
        onPage={onPage}
      />
    </div>
  );
}
