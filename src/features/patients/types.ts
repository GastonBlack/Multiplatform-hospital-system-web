import type { AccountStatus } from "@/features/auth/types";

export interface PatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  nationalIdentificationNumber: string;
  phoneNumber: string;
  dateOfBirth: string;
  accountStatus: AccountStatus;
}
