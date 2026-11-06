import { safeReturnPath } from "@/lib/auth/return-path";
import { SessionRenewal } from "../../components/session-renewal";

export const metadata = { title: "Restoring session" };

export default async function RefreshPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  return (
    <SessionRenewal returnTo={safeReturnPath((await searchParams).returnTo)} />
  );
}
