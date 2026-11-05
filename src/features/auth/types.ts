export type ProfileType = "Patient" | "Doctor" | "Staff";
export type AccountStatus =
  "PendingVerification" | "Active" | "Suspended" | "Deactivated";

export interface Session {
  userId: string;
  sessionId: string;
  profileType: 1 | 2 | 3;
  accountStatus: 1 | 2 | 3 | 4;
  // Missing or null roles never grant administrative access.
  role?: string | null;
}

export interface LoginRequest {
  nationalIdentificationNumber: string;
  password: string;
}
export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  sessionExpiresAt: string;
}
export interface RegisterPatientRequest extends LoginRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
}
export interface RegisterPatientResponse {
  userId: string;
  patientId: string;
  accountStatus: 1 | 2 | 3 | 4;
}
