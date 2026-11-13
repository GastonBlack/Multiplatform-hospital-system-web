import type { FormState } from "@/app/(auth)/types";

export interface DoctorRegistrationState extends FormState {
  employeeNumber?: string;
}
