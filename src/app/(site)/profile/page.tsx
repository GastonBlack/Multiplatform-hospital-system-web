import { requireSession } from "@/lib/auth/guards.server";
import { getProfile } from "@/features/users/api.server";
import { Profile } from "../components/profile";
import { ApiError } from "@/lib/api/errors";
import { redirect } from "next/navigation";

export const metadata = { title: "My profile" };
export default async function ProfilePage() {
  const { token } = await requireSession();
  let profile;
  try {
    profile = await getProfile(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect("/login?expired=1");
    throw error;
  }
  return <Profile profile={profile} />;
}
