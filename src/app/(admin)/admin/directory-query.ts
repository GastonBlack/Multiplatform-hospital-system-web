import type { DirectorySection } from "@/features/admin/types";

export type DirectorySearchParams = Record<
  string,
  string | string[] | undefined
>;

export function directoryQuery(
  section: DirectorySection,
  params: DirectorySearchParams,
) {
  const query = new URLSearchParams({ page: "1", pageSize: "25" });
  const keys = [
    "page",
    "name",
    "email",
    "nationalIdentificationNumber",
    "employeeNumber",
    "accountStatus",
    section === "doctors" ? "medicalLicenseNumber" : "staffRole",
  ];
  for (const key of keys) {
    const input = params[key];
    const value = Array.isArray(input) ? input[0] : input;
    if (typeof value === "string" && value.trim()) {
      query.set(
        key,
        key === "nationalIdentificationNumber" ? value : value.trim(),
      );
    }
  }
  return query;
}

export function directoryHref(
  section: DirectorySection,
  params: DirectorySearchParams,
  page = 1,
) {
  const query = directoryQuery(section, params);
  query.set("page", String(page));
  return `/admin/${section}?${query}`;
}

export function directoryPages(page: number, totalPages: number) {
  return [
    ...new Set([1, page - 2, page - 1, page, page + 1, page + 2, totalPages]),
  ]
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((first, second) => first - second);
}
