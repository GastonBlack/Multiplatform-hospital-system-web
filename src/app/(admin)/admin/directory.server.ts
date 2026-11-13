import "server-only";
import { redirect } from "next/navigation";
import {
  getDoctorDirectory,
  getStaffDirectory,
} from "@/features/admin/api.server";
import type {
  DirectorySection,
  DoctorDirectoryItem,
  StaffDirectoryItem,
  PagedResponse,
} from "@/features/admin/types";
import { ApiError } from "@/lib/api/errors";
import { renewalPath } from "@/lib/auth/return-path";
import { directoryQuery, type DirectorySearchParams } from "./directory-query";

export interface DirectoryState {
  data: PagedResponse<DoctorDirectoryItem | StaffDirectoryItem> | null;
  query: Record<string, string>;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function loadDirectory(
  section: DirectorySection,
  token: string,
  params: DirectorySearchParams,
): Promise<DirectoryState> {
  const query = directoryQuery(section, params);
  const applied = Object.fromEntries(query);
  try {
    const data = await (section === "doctors"
      ? getDoctorDirectory(token, query)
      : getStaffDirectory(token, query));
    return { data, query: applied };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401)
        redirect(renewalPath(`/admin/${section}?${query}`));
      return {
        data: null,
        query: applied,
        message:
          error.status === 400
            ? "Please check your filters and page number."
            : error.message,
        errors: Object.fromEntries(
          Object.keys(error.fields).map((key) => [
            key,
            ["Check this filter. The value was not accepted."],
          ]),
        ),
      };
    }
    return {
      data: null,
      query: applied,
      message: "Something went wrong. Please try again.",
    };
  }
}
