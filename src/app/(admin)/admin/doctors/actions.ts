"use server";

import { redirect } from "next/navigation";
import { registerDoctor } from "@/features/admin/api.server";
import { requireAdmin } from "@/lib/auth/guards.server";
import { renewalPath } from "@/lib/auth/return-path";
import { ApiError } from "@/lib/api/errors";
import { validateDoctorRegistration } from "./validation";
import type { DoctorRegistrationState } from "./types";

export async function registerDoctorAction(
  _previous: DoctorRegistrationState,
  data: FormData,
): Promise<DoctorRegistrationState> {
  const { token } = await requireAdmin();
  const { values, errors } = validateDoctorRegistration(data);
  if (Object.keys(errors).length)
    return { errors, message: "Please check the highlighted fields." };

  try {
    const response = await registerDoctor(token, values);
    return {
      success: true,
      message: "Doctor registered successfully.",
      employeeNumber: response.employeeNumber,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect(renewalPath("/admin/doctors"));
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
