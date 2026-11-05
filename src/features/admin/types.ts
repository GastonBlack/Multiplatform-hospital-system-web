import type { AccountStatus } from "@/features/auth/types";

interface EmployeeRegistration {
  firstName: string;
  lastName: string;
  email: string;
  nationalIdentificationNumber: string;
  password: string;
}
export interface RegisterDoctorRequest extends EmployeeRegistration {
  medicalLicenseNumber: string;
}
export interface RegisterDoctorResponse {
  userId: string;
  doctorId: string;
  employeeNumber: string;
  medicalLicenseNumber: string;
  accountStatus: AccountStatus;
}
export type StaffRole = "Receptionist" | "Administrator";
export interface RegisterStaffRequest extends EmployeeRegistration {
  staffRole: StaffRole;
}
export interface RegisterStaffResponse {
  userId: string;
  staffId: string;
  employeeNumber: string;
  staffRole: StaffRole;
  accountStatus: AccountStatus;
}
