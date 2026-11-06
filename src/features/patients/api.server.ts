import "server-only";
import { api } from "@/lib/api/client.server";
import type { PatientProfile } from "./types";

export const getPatientProfile = (token: string) =>
  api<PatientProfile>("/api/patients/me", { token });
