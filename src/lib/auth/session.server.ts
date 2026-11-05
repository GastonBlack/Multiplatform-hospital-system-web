import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/errors";

const name = "mhs_access";
export async function readToken() {
  return (await cookies()).get(name)?.value;
}
export async function saveToken(token: string, expiresAt: string) {
  const expires = new Date(expiresAt);
  if (
    !token ||
    !Number.isFinite(expires.getTime()) ||
    expires.getTime() <= Date.now()
  ) {
    throw new ApiError(502, "The service returned an invalid session.");
  }
  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}
export async function clearToken() {
  (await cookies()).delete(name);
}
