import type { RegisterStaffRequest, StaffRole } from "@/features/admin/types";
import { validateEmployeeRegistration } from "../registration-validation";

export function validateStaffRegistration(data: FormData) {
  const common = validateEmployeeRegistration(data);
  const input = data.get("staffRole");
  const staffRole = typeof input === "string" ? input : "";
  const values: RegisterStaffRequest = {
    ...common.values,
    staffRole: staffRole as StaffRole,
  };
  if (staffRole !== "Receptionist" && staffRole !== "Administrator")
    common.errors.staffRole = ["Choose Receptionist or Administrator."];
  return { values, errors: common.errors };
}
