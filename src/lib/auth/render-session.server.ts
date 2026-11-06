import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getValidatedSession } from "@/features/auth/api.server";
import { readToken, readRefreshToken } from "./session.server";
import { renewalPath } from "./return-path";

export async function getRenderSession() {
  const token = await readToken();
  const session = await getValidatedSession(token);
  if (session && token) return { session, token };
  if (await readRefreshToken()) {
    redirect(renewalPath((await headers()).get("x-mhs-return-path")));
  }
  return null;
}
