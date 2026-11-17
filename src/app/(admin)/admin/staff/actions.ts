"use server";

import { redirect } from "next/navigation";
import { registerStaff } from "@/features/admin/api.server";
import { requireAdmin } from "@/lib/auth/guards.server";
import { renewalPath } from "@/lib/auth/return-path";
import { ApiError } from "@/lib/api/errors";
import { validateStaffRegistration } from "./validation";
import type { StaffRegistrationState } from "./types";

export async function registerStaffAction(
  _previous: StaffRegistrationState,
  data: FormData,
): Promise<StaffRegistrationState> {
  const { token } = await requireAdmin();
  const { values, errors } = validateStaffRegistration(data);
  if (Object.keys(errors).length)
    return { errors, message: "Please check the highlighted fields." };
  try {
    const response = await registerStaff(token, values);
    return {
      success: true,
      message: "Staff member registered successfully.",
      employeeNumber: response.employeeNumber,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect(renewalPath("/admin/staff"));
      return {
        message: error.message,
        errors: Object.fromEntries(
          Object.keys(error.fields).map((name) => [
            name,
            ["Check this field. The value was not accepted."],
          ]),
        ),
      };
    }
    return { message: "Something went wrong. Please try again." };
  }
}
