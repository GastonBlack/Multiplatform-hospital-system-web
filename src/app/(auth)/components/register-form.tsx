"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Hospital,
  User,
  Lock,
  Calendar,
  Phone,
  CreditCard,
  Mail,
  Check,
  X,
} from "lucide-react";
import { registerAction } from "../actions";
import { validateForm } from "../validation";

interface Field {
  name: string;
  label: string;
  autoComplete: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  type?: string;
}

const fields: Field[] = [
  {
    name: "firstName",
    label: "First name",
    autoComplete: "given-name",
    maxLength: 120,
    minLength: 2,
  },
  {
    name: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    maxLength: 120,
    minLength: 2,
  },
  {
    name: "nationalIdentificationNumber",
    label: "National ID (8 digits)",
    autoComplete: "off",
    maxLength: 8,
    pattern: "[0-9]{8}",
  },
  {
    name: "phoneNumber",
    label: "Phone number",
    autoComplete: "tel",
    type: "tel",
    maxLength: 30,
  },
];

function getIconForField(fieldName: string) {
  switch (fieldName) {
    case "nationalIdentificationNumber":
      return <CreditCard className="size-4 text-[#242424] mr-2 shrink-0" />;
    case "phoneNumber":
      return <Phone className="size-4 text-[#242424] mr-2 shrink-0" />;
    case "dateOfBirth":
      return <Calendar className="size-4 text-[#242424] mr-2 shrink-0" />;
    case "email":
      return <Mail className="size-4 text-[#242424] mr-2 shrink-0" />;
    case "password":
    case "confirmPassword":
      return <Lock className="size-4 text-[#242424] mr-2 shrink-0" />;
    default:
      return <User className="size-4 text-[#242424] mr-2 shrink-0" />;
  }
}

export function RegisterForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(registerAction, {});
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center bg-white">
        <p role="status" className="text-base font-medium text-[#242424]">
          {state.message}
        </p>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center bg-[#142375] px-6 py-2 font-bold text-white uppercase tracking-wider hover:bg-[#152788] transition-colors"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const inputs: Field[] = [
    ...fields,
    {
      name: "email",
      label: "Email",
      autoComplete: "email",
      type: "email",
      maxLength: 150,
    },
    {
      name: "dateOfBirth",
      label: "Date of birth",
      autoComplete: "bday",
      type: "date",
    },
    {
      name: "password",
      label: "Password",
      autoComplete: "new-password",
      type: "password",
      minLength: 6,
      maxLength: 12,
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      autoComplete: "new-password",
      type: "password",
      minLength: 6,
      maxLength: 12,
    },
  ];

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex flex-col items-center px-2 pt-6 pb-8 sm:px-8 max-[380px]:px-0">
        <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-white shadow-inner">
          <Hospital
            aria-hidden="true"
            className="size-24 fill-[#142375] text-white"
          />
        </div>
        <form
          id="register-form"
          action={action}
          noValidate
          onReset={() => setValidationErrors(null)}
          onInput={(event) => {
            setValidationErrors(
              validateForm(new FormData(event.currentTarget), true).errors,
            );
          }}
          onSubmit={(event) => {
            const { errors } = validateForm(
              new FormData(event.currentTarget),
              true,
            );
            setValidationErrors(errors);
            if (Object.keys(errors).length) event.preventDefault();
          }}
          aria-busy={pending}
          className="grid w-full grid-cols-10 gap-x-4 gap-y-5 max-[480px]:gap-x-3"
        >
          {inputs.map((input) => (
            <div
              key={input.name}
              className={
                input.name === "email"
                  ? "col-span-8 min-w-0 max-[480px]:col-span-6"
                  : input.name === "dateOfBirth"
                    ? "col-span-2 min-w-0 max-[480px]:col-span-4"
                    : input.type === "password"
                      ? "col-span-5 min-w-0 w-full max-w-[180px]"
                      : "col-span-5 min-w-0"
              }
            >
              <label
                htmlFor={input.name}
                className="mb-1 block text-[11px] font-medium leading-4 text-[#242424]"
              >
                {input.label}
              </label>
              <div
                className={`flex items-center border-b-2 border-[#242424] focus-within:border-[#142375] ${input.type === "password" ? "h-8" : "h-9"}`}
              >
                {getIconForField(input.name)}
                <input
                  id={input.name}
                  name={input.name}
                  type={input.type || "text"}
                  autoComplete={input.autoComplete}
                  minLength={input.minLength}
                  maxLength={input.maxLength}
                  pattern={input.pattern}
                  max={input.type === "date" ? today : undefined}
                  inputMode={
                    input.name === "nationalIdentificationNumber"
                      ? "numeric"
                      : undefined
                  }
                  required
                  disabled={pending}
                  aria-invalid={
                    !!(validationErrors ?? state.errors)?.[input.name]
                  }
                  aria-describedby={
                    validationErrors !== null
                      ? `${input.name}-requirement`
                      : state.errors?.[input.name]
                        ? input.name + "-error"
                        : undefined
                  }
                  className={`h-full w-full min-w-0 bg-transparent font-medium text-[#242424] disabled:opacity-50 ${input.type === "password" || input.type === "date" ? "text-xs" : "text-sm max-[480px]:text-xs"}`}
                />
              </div>
              {validationErrors === null && state.errors?.[input.name] && (
                <p
                  id={input.name + "-error"}
                  className="mt-1 text-[11px] leading-4 text-red-700"
                >
                  {state.errors[input.name].join(" ")}
                </p>
              )}
            </div>
          ))}
          {validationErrors !== null && (
            <ul
              aria-label="Registration requirements"
              aria-live="polite"
              aria-atomic="true"
              className="col-span-full grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] leading-4 max-[480px]:grid-cols-1"
            >
              {[
                { name: "firstName", text: "First name: 2 to 120 characters." },
                { name: "lastName", text: "Last name: 2 to 120 characters." },
                {
                  name: "nationalIdentificationNumber",
                  text: "National ID: exactly 8 digits, without spaces, dots or hyphens.",
                },
                {
                  name: "phoneNumber",
                  text: "Phone number: valid format, up to 30 characters.",
                },
                {
                  name: "email",
                  text: "Email: valid address, up to 150 characters, without internal spaces.",
                },
                {
                  name: "dateOfBirth",
                  text: "Date of birth: valid date, not in the future.",
                },
                { name: "password", text: "Password: 6 to 12 characters." },
                {
                  name: "confirmPassword",
                  text: "Confirm password: must match your password.",
                },
              ].map((rule) => {
                const valid = !validationErrors[rule.name];
                const Icon = valid ? Check : X;
                return (
                  <li
                    key={rule.name}
                    id={`${rule.name}-requirement`}
                    className={`flex items-start gap-2 ${valid ? "text-emerald-700" : "text-red-700"}`}
                  >
                    <Icon
                      aria-hidden="true"
                      size={15}
                      strokeWidth={2.5}
                      className="shrink-0"
                    />
                    <span>
                      <span className="sr-only">
                        {valid ? "Met: " : "Required: "}
                      </span>
                      {rule.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {state.message && (
            <p
              role="alert"
              className="col-span-full text-xs leading-5 text-red-700"
            >
              {state.message}
            </p>
          )}
        </form>
      </div>
      <button
        type="submit"
        form="register-form"
        disabled={pending}
        className="w-full cursor-pointer bg-[#142375] py-4 text-center text-sm leading-7 font-bold tracking-[0.25em] text-white uppercase transition-colors hover:bg-[#152788] disabled:cursor-wait disabled:opacity-50"
      >
        {pending ? "LOADING..." : "REGISTER"}
      </button>
      <p className="pt-4 text-center text-xs leading-5 text-[#626a78]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#142375] underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
}
