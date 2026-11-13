import type { AccountStatus } from "@/features/auth/types";

export type DirectorySection = "doctors" | "staff";

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface EmployeeDirectoryItem {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  nationalIdentificationNumber: string | null;
  employeeNumber: string;
  accountStatus: AccountStatus;
}

export interface DoctorDirectoryItem extends EmployeeDirectoryItem {
  doctorId: string;
  medicalLicenseNumber: string;
}

export interface StaffDirectoryItem extends EmployeeDirectoryItem {
  staffId: string;
  staffRole: StaffRole;
}

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
