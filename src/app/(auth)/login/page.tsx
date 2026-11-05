import { LoginPageView } from "../components/login-page";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  return <LoginPageView expired={!!expired} />;
}
