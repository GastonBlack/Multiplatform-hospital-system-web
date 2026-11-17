"use client";

import { useActionState, useState } from "react";
import {
  BadgeCheck,
  Check,
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PasswordVisibilityButton } from "@/app/(auth)/components/password-visibility-button";
import type { DirectorySection } from "@/features/admin/types";
import type { FormState } from "@/app/(auth)/types";

const commonFields = [
  {
    name: "firstName",
    label: "First name",
    autoComplete: "given-name",
    icon: UserRound,
    maxLength: 120,
  },
  {
    name: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    icon: UserRound,
    maxLength: 120,
  },
  {
    name: "email",
    label: "Email",
    autoComplete: "email",
    icon: Mail,
    maxLength: 150,
  },
  {
    name: "nationalIdentificationNumber",
    label: "National ID",
    autoComplete: "off",
    icon: CreditCard,
    maxLength: 8,
  },
] as const;

const licenseField = {
  name: "medicalLicenseNumber",
  label: "Medical license number",
  autoComplete: "off",
  icon: BadgeCheck,
  maxLength: undefined,
} as const;
const roleField = {
  name: "staffRole",
  label: "Role",
  autoComplete: "off",
  icon: ShieldCheck,
  maxLength: undefined,
} as const;
const passwordField = {
  name: "password",
  label: "Password",
  autoComplete: "new-password",
  icon: Lock,
  maxLength: 12,
} as const;

type EmployeeRegistrationState = FormState & { employeeNumber?: string };

interface EmployeeRegistrationFormProps {
  section: DirectorySection;
  registerAction: (
    previous: EmployeeRegistrationState,
    data: FormData,
  ) => Promise<EmployeeRegistrationState>;
}

export function EmployeeRegistrationForm({
  section,
  registerAction,
}: EmployeeRegistrationFormProps) {
  const doctors = section === "doctors";
  const prefix = doctors ? "doctor" : "staff";
  const title = doctors ? "Register doctor" : "Register staff member";
  const fields = [
    ...commonFields,
    doctors ? licenseField : roleField,
    passwordField,
  ];
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(({ name }) => [name, ""])),
  );
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [state, action, pending] = useActionState(
    async (previous: EmployeeRegistrationState, data: FormData) => {
      const result = await registerAction(previous, data);
      if (result.success) {
        setValues(Object.fromEntries(fields.map(({ name }) => [name, ""])));
        setPasswordVisible(false);
      }
      return result;
    },
    {},
  );

  return (
    <section
      aria-labelledby={`register-${prefix}-title`}
      className="max-w-[880px] text-[#242424]"
    >
      <h2 id={`register-${prefix}-title`} className="text-base font-semibold">
        {title}
      </h2>
      <form
        action={action}
        noValidate
        aria-busy={pending}
        className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[#e6e9f0] pt-6 max-[640px]:grid-cols-1"
      >
        {fields.map(({ name, label, autoComplete, icon: Icon, maxLength }) => {
          const inputId = `${prefix}-${name}`;
          const errors = state.errors?.[name];
          const hintId =
            name === "nationalIdentificationNumber" || name === "password"
              ? `${inputId}-hint`
              : undefined;
          return (
            <div key={name} className="min-w-0">
              <label
                htmlFor={inputId}
                className="mb-2 block text-xs font-medium text-[#626a78]"
              >
                {label}
              </label>
              <div className="group relative flex h-10 items-center border-b border-[#79bfd7] px-1 transition-colors focus-within:bg-[#f1faff]">
                <Icon
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.6}
                  className="mr-3 shrink-0 text-[#737986]"
                />
                {name === "staffRole" ? (
                  <select
                    id={inputId}
                    name={name}
                    value={values[name]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                    required
                    disabled={pending}
                    aria-invalid={!!errors}
                    aria-describedby={errors ? `${inputId}-error` : undefined}
                    className="h-full w-full min-w-0 bg-transparent text-sm outline-none focus-visible:shadow-none! disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                ) : (
                  <input
                    id={inputId}
                    name={name}
                    value={values[name]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                    type={
                      name === "password" && !passwordVisible
                        ? "password"
                        : name === "email"
                          ? "email"
                          : "text"
                    }
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    inputMode={
                      name === "nationalIdentificationNumber"
                        ? "numeric"
                        : undefined
                    }
                    required
                    disabled={pending}
                    aria-invalid={!!errors}
                    aria-describedby={
                      [hintId, errors ? `${inputId}-error` : undefined]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    className="h-full w-full min-w-0 bg-transparent text-sm outline-none focus-visible:shadow-none! disabled:opacity-50 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                )}
                {name === "password" && (
                  <PasswordVisibilityButton
                    inputId={inputId}
                    label={label}
                    visible={passwordVisible}
                    onToggle={() => setPasswordVisible((visible) => !visible)}
                    disabled={pending}
                  />
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-center scale-x-0 bg-[#0284c7] transition-transform duration-300 group-focus-within:scale-x-100 motion-reduce:transition-none"
                />
              </div>
              {hintId && (
                <p
                  id={hintId}
                  className="mt-2 text-[11px] leading-4 text-[#626a78]"
                >
                  {name === "password"
                    ? "6–12 characters."
                    : "Exactly 8 digits. No spaces, dots or hyphens."}
                </p>
              )}
              {errors && (
                <p
                  id={`${inputId}-error`}
                  className="mt-2 text-xs leading-5 text-red-700"
                >
                  {errors.join(" ")}
                </p>
              )}
            </div>
          );
        })}
        {state.message && (
          <div
            role={state.success ? "status" : "alert"}
            className={`col-span-full border-l-2 px-4 py-3 text-sm leading-6 ${state.success ? "border-[#367891] bg-[#eff9fd] text-[#286780]" : "border-red-600 bg-red-50 text-red-700"}`}
          >
            <p className="flex items-center gap-2">
              {state.success && <Check aria-hidden="true" size={17} />}
              {state.message}
            </p>
            {state.success && (
              <p className="mt-1 font-semibold">
                Employee number: {state.employeeNumber}
              </p>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="col-span-full mt-2 w-fit cursor-pointer rounded-r-md border-l-2 border-[#8acbe0] bg-[#eff9fd] px-6 py-3 text-sm font-semibold text-[#286780] hover:bg-[#e3f4fb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#367891] disabled:cursor-wait disabled:opacity-50"
        >
          {pending
            ? `Registering ${doctors ? "doctor" : "staff member"}...`
            : title}
        </button>
      </form>
    </section>
  );
}
