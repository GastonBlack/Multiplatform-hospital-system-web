"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { directoryPages } from "../admin/directory-query";

interface EmployeePaginationProps {
  section: DirectorySection;
  data: DirectoryState["data"];
  pending: boolean;
  onPage: (page: number) => void;
}

export function EmployeePagination({
  section,
  data,
  pending,
  onPage,
}: EmployeePaginationProps) {
  const title = section === "doctors" ? "Doctors" : "Staff";
  const pages = data ? directoryPages(data.page, data.totalPages) : [];
  return (
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
          disabled={pending || !data || data.page <= 1 || data.totalPages === 0}
          onClick={() =>
            data && onPage(Math.min(data.page - 1, data.totalPages))
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
              onClick={() => onPage(page)}
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
          onClick={() => data && onPage(data.page + 1)}
          aria-label="Next page"
          className="grid size-8 place-items-center rounded disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </div>
    </nav>
  );
}
