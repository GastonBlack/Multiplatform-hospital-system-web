import type { FormState } from "@/app/(auth)/types";

export interface StaffRegistrationState extends FormState {
  employeeNumber?: string;
}
