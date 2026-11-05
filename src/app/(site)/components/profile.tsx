import { LogoutButton } from "@/app/(auth)/components/logout-button";
import type { UserProfile } from "@/features/users/types";

const labels: Record<string, string> = {
  Patient: "Patient",
  Doctor: "Doctor",
  Staff: "Staff",
  PendingVerification: "Pending verification",
  Active: "Active",
  Suspended: "Suspended",
  Deactivated: "Deactivated",
};
export function Profile({ profile }: { profile: UserProfile }) {
  return (
    <section className="mx-auto my-10 flex max-w-[600px] flex-col gap-4 rounded-xl border border-[#e7e9ee] bg-white p-7">
      <p className="text-[11px] font-semibold tracking-[0.1em] text-[#626a78]">
        MY ACCOUNT
      </p>
      <h1 className="text-[26px] leading-tight font-extrabold tracking-[-0.035em]">
        My profile
      </h1>
      <dl>
        {[
          ["Name", `${profile.firstName} ${profile.lastName}`],
          ["Email", profile.email],
          ["Profile type", labels[profile.profileType] ?? "Unknown"],
          ["Account status", labels[profile.accountStatus] ?? "Unknown"],
        ].map(([label, value]) => (
          <div key={label} className="border-t border-[#e7e9ee] py-3">
            <dt className="text-xs text-[#626a78]">{label}</dt>
            <dd className="mt-1 [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>
      <LogoutButton />
    </section>
  );
}
