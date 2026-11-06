import { Building2, CalendarDays, CircleCheck, IdCard, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import type { UserProfile } from "@/features/users/types";
import type { PatientProfile } from "@/features/patients/types";

const accountStatuses = {
  PendingVerification: "Pending verification",
  Active: "Active",
  Suspended: "Suspended",
  Deactivated: "Deactivated",
};

export function Profile({ profile, patient }: { profile: UserProfile; patient?: PatientProfile }) {
  const needsConfirmation =
    profile.profileType === "Patient" &&
    profile.accountStatus === "PendingVerification";
  const active = profile.accountStatus === "Active";

  return (
    <section className="mx-auto max-w-[880px] py-10 text-[#242424] sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eef1fb] text-[#142375]">
            <UserRound aria-hidden="true" size={24} strokeWidth={1.6} />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">
            My profile
          </h1>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-[#f0f7f3] text-[#32654b]" : "bg-[#f4f5f7] text-[#626a78]"}`}
        >
          <span className="sr-only">Account status: </span>
          {active ? (
            <CircleCheck aria-hidden="true" size={14} strokeWidth={1.7} />
          ) : (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-current"
            />
          )}
          {accountStatuses[profile.accountStatus] ?? "Unknown"}
        </span>
      </header>

      {needsConfirmation && (
        <aside
          aria-labelledby="registration-next-step"
          className="mt-8 border-l-[3px] border-[#142375] bg-[#f3f5fc] px-5 py-5 sm:px-6"
        >
          <div className="flex items-start gap-4">
            <Building2
              aria-hidden="true"
              size={22}
              strokeWidth={1.6}
              className="mt-0.5 shrink-0 text-[#142375]"
            />
            <div>
              <h2
                id="registration-next-step"
                className="text-sm font-semibold text-[#142375]"
              >
                Next step: confirm your registration
              </h2>
              <p className="mt-2 max-w-[64ch] text-sm leading-6 text-[#536078]">
                Visit the hospital in person to confirm your registration. You
                can already view your account details here.
              </p>
            </div>
          </div>
        </aside>
      )}

      <section aria-labelledby="account-details" className="mt-10">
        <h2
          id="account-details"
          className="mb-5 text-base font-semibold tracking-[-0.02em]"
        >
          Account details
        </h2>
        <dl className="grid grid-cols-2 border-t border-[#e6e9f0] max-[480px]:grid-cols-1">
          {[
            { label: "First name", value: profile.firstName, icon: UserRound },
            { label: "Last name", value: profile.lastName, icon: UserRound },
            { label: "Email address", value: profile.email, icon: Mail },
            ...(patient ? [
              { label: "Phone number", value: patient.phoneNumber, icon: Phone },
              { label: "National ID", value: patient.nationalIdentificationNumber, icon: IdCard },
              {
                label: "Date of birth",
                value: new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${patient.dateOfBirth}T00:00:00Z`)),
                icon: CalendarDays,
              },
            ] : []),
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-start gap-3 border-b border-[#e6e9f0] py-5 pr-5"
            >
              <Icon
                aria-hidden="true"
                size={18}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 text-[#737986]"
              />
              <div className="min-w-0">
                <dt className="text-xs text-[#626a78]">{label}</dt>
                <dd className="mt-1.5 text-sm font-medium leading-6 [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="change-password" className="mt-10 border-t border-[#e6e9f0] pt-7">
        <div className="flex items-center gap-3">
          <LockKeyhole aria-hidden="true" size={20} strokeWidth={1.6} className="text-[#142375]" />
          <h2 id="change-password" className="text-base font-semibold tracking-[-0.02em]">Change password</h2>
          <span className="rounded-full bg-[#eef1fb] px-2.5 py-1 text-[11px] font-medium text-[#142375]">Coming soon</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#626a78]">Password changes will be available here soon.</p>
        <fieldset disabled className="mt-6 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-5 max-[480px]:grid-cols-1">
          <legend className="sr-only">Change password (coming soon)</legend>
          {[
            { id: "current-password", label: "Current password", autoComplete: "current-password" },
            { id: "new-password", label: "New password", autoComplete: "new-password" },
            { id: "confirm-new-password", label: "Confirm new password", autoComplete: "new-password" },
          ].map(({ id, label, autoComplete }, index) => (
            <div key={id} className={index === 0 ? "col-span-full" : ""}>
              <label htmlFor={id} className="text-xs text-[#626a78]">{label}</label>
              <input id={id} type="password" autoComplete={autoComplete} placeholder={label} className="mt-2 h-10 w-full cursor-not-allowed border-b border-[#d7dbe5] bg-[#f8f9fc] px-3 text-sm disabled:opacity-70" />
            </div>
          ))}
          <button type="button" className="col-span-full mt-1 w-fit cursor-not-allowed rounded px-5 py-2.5 text-xs font-semibold text-white disabled:bg-[#142375]/50">Update password</button>
        </fieldset>
      </section>
    </section>
  );
}
