import "server-only";
import { api } from "@/lib/api/client.server";
import type { UserProfile } from "./types";

export const getProfile = (token: string) =>
  api<UserProfile>("/api/users/me", { token });
