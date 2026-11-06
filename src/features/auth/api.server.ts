import "server-only";
import { api } from "@/lib/api/client.server";
import type {
  AuthenticationResponse,
  LoginRequest,
  RegisterPatientRequest,
  RegisterPatientResponse,
  Session,
} from "./types";
import { ApiError } from "@/lib/api/errors";
import { isSession } from "@/lib/auth/policy";

export const login = (body: LoginRequest) =>
  api<AuthenticationResponse>("/api/auth/login", { method: "POST", body });
export const refresh = (refreshToken: string) =>
  api<AuthenticationResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
export const registerPatient = (body: RegisterPatientRequest) =>
  api<RegisterPatientResponse>("/api/patients/register", {
    method: "POST",
    body,
  });
export const getSession = (token: string) =>
  api<Session>("/api/auth/session", { token });
export const revokeSession = (token: string) =>
  api<void>("/api/auth/logout", { method: "POST", token });

export async function getValidatedSession(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  try {
    const session = await getSession(token);
    if (!isSession(session))
      throw new ApiError(502, "The service returned an invalid session.");
    return session;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
