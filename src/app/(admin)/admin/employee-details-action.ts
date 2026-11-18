"use server";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDoctorDetails, getStaffDetails } from "@/features/admin/api.server";
import type { DirectorySection } from "@/features/admin/types";
import { ApiError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/guards.server";
import { renewalPath } from "@/lib/auth/return-path";

export async function getEmployeeDetailsAction(
  section: DirectorySection,
  profileId: string,
) {
  const { token } = await requireAdmin();
  if (
    (section !== "doctors" && section !== "staff") ||
    typeof profileId !== "string" ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(profileId)
  ) {
    notFound();
  }

  try {
    const data = await (section === "doctors"
      ? getDoctorDetails(token, profileId)
      : getStaffDetails(token, profileId));
    return { data };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        const returnTo = (await headers()).get("x-mhs-return-path");
        redirect(renewalPath(returnTo ?? `/admin/${section}`));
      }
      return {
        message:
          error.status === 404
            ? "This profile could not be found."
            : error.message,
      };
    }
    return { message: "Something went wrong. Please try again." };
  }
}
