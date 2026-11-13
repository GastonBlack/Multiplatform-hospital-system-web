"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DoctorRegistrationForm } from "./doctor-registration-form";
import { EmployeeHeader } from "./employee-header";
import { EmployeeFilters } from "./employee-filters";
import { EmployeeTable } from "./employee-table";
import type { DirectorySection } from "@/features/admin/types";
import type { DirectoryState } from "../admin/directory.server";
import { directoryHref } from "../admin/directory-query";

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
  function goToPage(page: number) {
    startTransition(() =>
      router.push(directoryHref(section, query, page), { scroll: false }),
    );
  }

  return (
    <section className="mx-auto max-w-[1280px] rounded-2xl border border-[#dce2ec] bg-[#f2f4f8] p-3 text-[#242424] sm:p-6">
      <EmployeeHeader
        section={section}
        registrationOpen={registrationOpen}
        pending={pending}
        onToggle={() => {
          if (registrationOpen) startTransition(() => router.refresh());
          setRegistrationOpen((open) => !open);
        }}
      />
      {registrationOpen ? (
        <div
          id="doctor-registration"
          className="mt-5 rounded-xl border border-[#d1dbe9] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:p-6"
        >
          <DoctorRegistrationForm />
        </div>
      ) : (
        <>
          <EmployeeFilters
            section={section}
            query={query}
            errors={errors}
            pending={pending}
            onSearch={(filters) =>
              startTransition(() =>
                router.push(directoryHref(section, filters), { scroll: false }),
              )
            }
            onClear={() =>
              startTransition(() =>
                router.push(directoryHref(section, {}), { scroll: false }),
              )
            }
          />
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
          <EmployeeTable
            section={section}
            data={data}
            pending={pending}
            onPage={goToPage}
          />
        </>
      )}
    </section>
  );
}
