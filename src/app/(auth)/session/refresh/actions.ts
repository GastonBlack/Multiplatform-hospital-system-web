"use server";

import { resolveSessionTokens } from "@/lib/auth/renewal.server";
import {
  readToken,
  readRefreshToken,
  saveTokens,
  clearTokens,
} from "@/lib/auth/session.server";
import { ApiError } from "@/lib/api/errors";

export async function renewSessionAction(): Promise<{
  status: "ready" | "expired" | "error";
  message?: string;
}> {
  try {
    const result = await resolveSessionTokens(
      await readToken(),
      await readRefreshToken(),
    );
    if (result.kind === "expired") {
      await clearTokens();
      return { status: "expired" };
    }
    if (result.kind === "renewed") await saveTokens(result.tokens);
    return { status: "ready" };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ApiError
          ? error.message
          : "Unable to renew your session. Please try again.",
    };
  }
}
