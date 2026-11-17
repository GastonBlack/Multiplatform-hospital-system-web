import type { EmployeeRegistration } from "@/features/admin/types";

export function validateEmployeeRegistration(data: FormData) {
  const read = (name: string) => {
    const value = data.get(name);
    return typeof value === "string" ? value : "";
  };
  const values: EmployeeRegistration = {
    firstName: read("firstName"),
    lastName: read("lastName"),
    email: read("email").trim().toLowerCase(),
    nationalIdentificationNumber: read("nationalIdentificationNumber"),
    password: read("password"),
  };
  const errors: Record<string, string[]> = {};
  for (const name of ["firstName", "lastName"] as const) {
    if (
      !values[name].trim() ||
      values[name].length < 2 ||
      values[name].length > 120
    )
      errors[name] = ["Enter 2–120 characters."];
  }
  if (
    values.email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
  )
    errors.email = ["Enter a valid email, up to 150 characters."];
  if (
    values.nationalIdentificationNumber.length !== 8 ||
    !/^[0-9]{8}$/.test(values.nationalIdentificationNumber)
  )
    errors.nationalIdentificationNumber = [
      "Enter exactly 8 digits, without spaces, dots or hyphens.",
    ];
  if (values.password.length < 6 || values.password.length > 12)
    errors.password = ["Password must be 6–12 characters."];
  return { values, errors };
}
