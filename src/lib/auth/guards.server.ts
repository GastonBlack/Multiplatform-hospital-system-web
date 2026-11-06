import "server-only";
import { notFound, redirect } from "next/navigation";
import { getRenderSession } from "./render-session.server";
import { isActiveAdmin } from "./policy";

export async function requireSession() {
  const auth = await getRenderSession();
  if (!auth) redirect("/login?expired=1");
  return auth;
}

export async function requireAdmin() {
  const auth = await getRenderSession();
  if (!auth || !isActiveAdmin(auth.session)) notFound();
  return auth;
}
