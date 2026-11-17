import { LoginPageView } from "../components/login-page";
import { redirect } from "next/navigation";
import { getRenderSession } from "@/lib/auth/render-session.server";
import { ApiError } from "@/lib/api/errors";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  let unavailable = false;
  try {
    if (await getRenderSession("/profile")) redirect("/profile");
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    unavailable = true;
  }
  return <LoginPageView expired={!!expired} unavailable={unavailable} />;
}
