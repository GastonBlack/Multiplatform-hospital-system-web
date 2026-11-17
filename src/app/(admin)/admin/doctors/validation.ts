import type { RegisterDoctorRequest } from "@/features/admin/types";
import { validateEmployeeRegistration } from "../registration-validation";

export function validateDoctorRegistration(data: FormData) {
  const common = validateEmployeeRegistration(data);
  const input = data.get("medicalLicenseNumber");
  const medicalLicenseNumber = typeof input === "string" ? input : "";
  const values: RegisterDoctorRequest = {
    ...common.values,
    medicalLicenseNumber,
  };
  if (!medicalLicenseNumber.trim())
    common.errors.medicalLicenseNumber = ["Enter a medical license number."];
  return { values, errors: common.errors };
}
