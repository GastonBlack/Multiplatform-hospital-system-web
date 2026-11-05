import type { AccountStatus, ProfileType } from "@/features/auth/types";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileType: ProfileType;
  accountStatus: AccountStatus;
}
