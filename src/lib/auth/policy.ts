import type { Session } from "@/features/auth/types";

export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Session>;
  return (
    typeof s.userId === "string" &&
    s.userId.length > 0 &&
    typeof s.sessionId === "string" &&
    s.sessionId.length > 0 &&
    [1, 2, 3].includes(s.profileType as number) &&
    [1, 2, 3, 4].includes(s.accountStatus as number) &&
    (s.role === undefined || s.role === null || typeof s.role === "string")
  );
}

export function isActiveAdmin(session: unknown): boolean {
  return (
    isSession(session) &&
    session.role === "Administrator" &&
    session.accountStatus === 2
  );
}
