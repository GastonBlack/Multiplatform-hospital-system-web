import "server-only";
import { api } from "@/lib/api/client.server";
import type {
  DoctorDirectoryItem,
  StaffDirectoryItem,
  PagedResponse,
  RegisterDoctorRequest,
  RegisterDoctorResponse,
  RegisterStaffRequest,
  RegisterStaffResponse,
} from "./types";

export const getDoctorDirectory = (token: string, query: URLSearchParams) =>
  api<PagedResponse<DoctorDirectoryItem>>(`/api/doctors?${query}`, { token });

export const getStaffDirectory = (token: string, query: URLSearchParams) =>
  api<PagedResponse<StaffDirectoryItem>>(`/api/staff?${query}`, { token });

export const registerDoctor = (token: string, body: RegisterDoctorRequest) =>
  api<RegisterDoctorResponse>("/api/doctors/register", {
    method: "POST",
    token,
    body,
  });

export const registerStaff = (token: string, body: RegisterStaffRequest) =>
  api<RegisterStaffResponse>("/api/staff/register", {
    method: "POST",
    token,
    body,
  });
