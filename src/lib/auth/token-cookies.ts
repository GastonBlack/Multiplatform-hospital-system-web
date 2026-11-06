import type { AuthenticationResponse } from "@/features/auth/types";
import { ApiError } from "@/lib/api/errors";

export const accessCookie = "mhs_access";
export const refreshCookie = "mhs_refresh";

export function tokenCookies(
  tokens: AuthenticationResponse,
  production: boolean,
  now = Date.now(),
) {
  const accessExpiry = new Date(tokens.accessTokenExpiresAt);
  const sessionExpiry = new Date(tokens.sessionExpiresAt);
  if (
    typeof tokens.accessToken !== "string" ||
    !tokens.accessToken ||
    typeof tokens.refreshToken !== "string" ||
    tokens.refreshToken.length !== 64 ||
    !/^[0-9a-fA-F]{64}$/.test(tokens.refreshToken) ||
    !Number.isFinite(accessExpiry.getTime()) ||
    !Number.isFinite(sessionExpiry.getTime()) ||
    accessExpiry.getTime() <= now ||
    sessionExpiry.getTime() < accessExpiry.getTime()
  )
    throw new ApiError(502, "The service returned an invalid session.");

  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: production,
    path: "/",
  };
  return [
    {
      name: accessCookie,
      value: tokens.accessToken,
      options: { ...options, expires: accessExpiry },
    },
    {
      name: refreshCookie,
      value: tokens.refreshToken,
      options: { ...options, expires: sessionExpiry },
    },
  ];
}
