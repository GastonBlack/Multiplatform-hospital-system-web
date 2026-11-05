import "server-only";
import { notFound, redirect } from "next/navigation";
import { getValidatedSession } from "@/features/auth/api.server";
import { readToken } from "./session.server";
import { isActiveAdmin } from "./policy";

export async function requireSession() {
  const token = await readToken();
  if (!token) redirect("/login");
  const session = await getValidatedSession(token);
  if (!session) redirect("/login?expired=1");
  return { session, token };
}

export async function requireAdmin() {
  const token = await readToken();
  if (!token) notFound();
  const session = await getValidatedSession(token);
  if (!isActiveAdmin(session)) notFound();
  return { session, token };
}
