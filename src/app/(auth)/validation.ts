import type {
  LoginRequest,
  RegisterPatientRequest,
} from "@/features/auth/types";
import type { FormState } from "./types";

export function hospitalToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function validateForm(
  data: FormData,
  registration: boolean,
): {
  values: RegisterPatientRequest;
  errors: NonNullable<FormState["errors"]>;
} {
  const read = (key: string) => {
    const value = data instanceof FormData ? data.get(key) : undefined;
    return typeof value === "string" ? value : "";
  };
  const values: RegisterPatientRequest = {
    email: read("email").trim().toLowerCase(),
    password: read("password"),
    firstName: read("firstName"),
    lastName: read("lastName"),
    nationalIdentificationNumber: read("nationalIdentificationNumber"),
    phoneNumber: read("phoneNumber"),
    dateOfBirth: read("dateOfBirth"),
  };
  const errors: Record<string, string[]> = {};
  if (
    values.nationalIdentificationNumber.length !== 8 ||
    !/^[0-9]{8}$/.test(values.nationalIdentificationNumber)
  )
    errors.nationalIdentificationNumber = [
      "Enter exactly 8 digits, without spaces, dots or hyphens.",
    ];
  if (values.password.length < 6 || values.password.length > 12)
    errors.password = ["Password must be 6–12 characters."];
  if (registration) {
    if (!read("confirmPassword") || read("confirmPassword") !== values.password)
      errors.confirmPassword = ["Passwords must match."];
    if (
      values.email.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    )
      errors.email = ["Enter a valid email, up to 150 characters."];
    for (const key of ["firstName", "lastName"] as const) {
      if (
        !values[key].trim() ||
        values[key].length < 2 ||
        values[key].length > 120
      )
        errors[key] = ["Enter 2–120 characters."];
    }
    if (
      values.phoneNumber.length > 30 ||
      !/^\+?[0-9][0-9 ().-]*[0-9]$/.test(values.phoneNumber)
    )
      errors.phoneNumber = ["Enter a valid phone number, up to 30 characters."];
    const date = values.dateOfBirth;
    const parsed = new Date(`${date}T12:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      date < "0001-01-01" ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date ||
      date > hospitalToday()
    )
      errors.dateOfBirth = ["Enter a valid date that is not in the future."];
  }
  return { values, errors };
}

export function loginValues(values: RegisterPatientRequest): LoginRequest {
  return {
    nationalIdentificationNumber: values.nationalIdentificationNumber,
    password: values.password,
  };
}
