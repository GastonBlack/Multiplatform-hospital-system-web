import "server-only";
import { getValidatedSession, refresh } from "@/features/auth/api.server";
import type { AuthenticationResponse } from "@/features/auth/types";
import { ApiError } from "@/lib/api/errors";
import { tokenCookies } from "./token-cookies";

type Renewal =
  | { kind: "current"; accessToken: string }
  | { kind: "renewed"; tokens: AuthenticationResponse }
  | { kind: "expired" };

export async function resolveSessionTokens(
  accessToken?: string,
  refreshToken?: string,
): Promise<Renewal> {
  // Another tab may already have renewed the cookies before this action starts.
  if (accessToken && (await getValidatedSession(accessToken)))
    return { kind: "current", accessToken };
  if (!refreshToken) return { kind: "expired" };
  try {
    const tokens = await refresh(refreshToken);
    tokenCookies(tokens, false);
    return { kind: "renewed", tokens };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 401)
    )
      return { kind: "expired" };
    throw error;
  }
}
