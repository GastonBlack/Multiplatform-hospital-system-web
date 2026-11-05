"use server";

import { redirect } from "next/navigation";
import {
  login,
  registerPatient,
  revokeSession,
} from "@/features/auth/api.server";
import { clearToken, readToken, saveToken } from "@/lib/auth/session.server";
import { ApiError } from "@/lib/api/errors";
import { loginValues, validateForm } from "./validation";
import type { FormState } from "./types";

function failure(error: unknown): FormState {
  if (error instanceof ApiError) {
    // Translate validation messages instead of exposing raw server diagnostics.
    const errors = Object.fromEntries(
      Object.entries(error.fields).map(([key]) => [
        key,
        ["Check this field. The value was not accepted."],
      ]),
    );
    return { message: error.message, errors };
  }
  return { message: "Something went wrong. Please try again." };
}

export async function loginAction(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const { values, errors } = validateForm(data, false);
  if (Object.keys(errors).length)
    return { errors, message: "Please check the highlighted fields." };
  try {
    const response = await login(loginValues(values));
    await saveToken(response.accessToken, response.accessTokenExpiresAt);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { message: "Incorrect ID or password. Please try again." };
    }
    return failure(error);
  }
  redirect("/perfil");
}

export async function registerAction(
  _previous: FormState,
  data: FormData,
): Promise<FormState> {
  const { values, errors } = validateForm(data, true);
  if (Object.keys(errors).length)
    return { errors, message: "Please check the highlighted fields." };
  try {
    await registerPatient(values);
  } catch (error) {
    return failure(error);
  }
  return {
    success: true,
    message:
      "Your account has been created and is pending verification. You can now sign in.",
  };
}

export async function logoutAction(): Promise<FormState> {
  const token = await readToken();
  if (token) {
    try {
      await revokeSession(token);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        // Retain the cookie so revocation can be retried instead of claiming success.
        return failure(error);
      }
    }
  }
  await clearToken();
  redirect("/login");
}
