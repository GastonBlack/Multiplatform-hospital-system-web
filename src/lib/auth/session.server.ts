import "server-only";
import { cookies } from "next/headers";
import type { AuthenticationResponse } from "@/features/auth/types";
import { accessCookie, refreshCookie, tokenCookies } from "./token-cookies";

export async function readToken() {
  return (await cookies()).get(accessCookie)?.value;
}
export async function readRefreshToken() {
  return (await cookies()).get(refreshCookie)?.value;
}
export async function saveTokens(tokens: AuthenticationResponse) {
  const values = tokenCookies(tokens, process.env.NODE_ENV === "production");
  const jar = await cookies();
  for (const cookie of values)
    jar.set(cookie.name, cookie.value, cookie.options);
}
export async function clearTokens() {
  const jar = await cookies();
  jar.delete(accessCookie);
  jar.delete(refreshCookie);
}
