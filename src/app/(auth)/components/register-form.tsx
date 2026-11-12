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
import { PasswordVisibilityButton } from "./password-visibility-button";

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
  const iconProps = {
    "aria-hidden": true,
    strokeWidth: 1.6,
    className: "mr-2 size-4 shrink-0 fill-none text-[#737986]",
  } as const;
  switch (fieldName) {
    case "nationalIdentificationNumber":
      return <CreditCard {...iconProps} />;
    case "phoneNumber":
      return <Phone {...iconProps} />;
    case "dateOfBirth":
      return <Calendar {...iconProps} />;
    case "email":
      return <Mail {...iconProps} />;
    case "password":
    case "confirmPassword":
      return <Lock {...iconProps} />;
    default:
      return <User {...iconProps} />;
  }
}

export function RegisterForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(registerAction, {});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [visibleRequirements, setVisibleRequirements] = useState<string[]>([]);

  function checkRequirements(data: FormData) {
    const { errors } = validateForm(data, true);
    setValidationErrors(errors);
    setVisibleRequirements((previous) => [...new Set([...previous, ...Object.keys(errors)])]);
    return errors;
  }

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center bg-white">
        <Check aria-hidden="true" size={28} strokeWidth={1.6} className="text-[#367891]" />
        <h1 className="text-xl font-medium tracking-[-0.03em]">Account created</h1>
        <p role="status" className="text-base font-medium text-[#242424]">
          {state.message}
        </p>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-r-md border-l-2 border-[#8acbe0] bg-[#eff9fd] px-6 py-2 text-[13px] font-semibold text-[#286780] hover:bg-[#e3f4fb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#367891]"
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
      <div className="flex flex-col items-center px-2 pt-7 pb-7 sm:px-8 sm:pt-8">
        <div className="flex flex-col items-center">
          <Hospital
            aria-hidden="true"
            strokeWidth={1.4}
            className="size-12 shrink-0 fill-none text-[#367891]"
          />
          <span className="mt-1 text-[11px] font-bold tracking-[0.12em] text-[#367891]">MHS</span>
        </div>
        <h1 className="mt-5 mb-7 text-xl font-medium tracking-[-0.03em]">Create account</h1>
        <form
          id="register-form"
          action={action}
          noValidate
          onReset={() => {
            setValidationErrors(null);
            setVisibleRequirements([]);
            setVisiblePasswords({});
          }}
          onInput={(event) => {
            if (validationErrors === null) return;
            checkRequirements(new FormData(event.currentTarget));
          }}
          onSubmit={(event) => {
            const errors = checkRequirements(new FormData(event.currentTarget));
            if (Object.keys(errors).length) event.preventDefault();
          }}
          aria-busy={pending}
          className="grid w-full grid-cols-10 gap-x-4 gap-y-5 max-[480px]:gap-x-3"
        >
          {inputs.map((input) => (
            <div
              key={input.name}
              className={
                input.type === "password"
                  ? "col-span-full w-full max-w-[180px] min-w-0 justify-self-center"
                  : input.type === "date"
                    ? "col-span-5 w-[164px] max-w-full min-w-0 max-[480px]:col-span-full"
                    : "col-span-5 min-w-0"
              }
            >
              <label
                htmlFor={input.name}
                className="mb-2 block text-xs font-medium leading-4 text-[#626a78]"
              >
                {input.label}
              </label>
              <div
                className={`group relative flex items-center border-b border-[#79bfd7] px-1 transition-colors focus-within:bg-[#f1faff] hover:bg-[#f8fcfe] motion-reduce:transition-none ${input.type === "password" ? "h-8" : "h-9"}`}
              >
                {getIconForField(input.name)}
                <input
                  id={input.name}
                  name={input.name}
                  type={input.type === "password" && visiblePasswords[input.name] ? "text" : input.type || "text"}
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
                    visibleRequirements.includes(input.name)
                      ? `${input.name}-requirement`
                      : validationErrors === null && state.errors?.[input.name]
                        ? input.name + "-error"
                        : undefined
                  }
                  className={`h-full w-full min-w-0 bg-transparent text-[#363636] outline-none focus-visible:shadow-none! disabled:opacity-50 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${input.type === "password" || input.type === "date" ? "text-xs" : "text-[13px] max-[480px]:text-xs"}`}
                />
                {input.type === "password" && (
                  <PasswordVisibilityButton
                    visible={!!visiblePasswords[input.name]}
                    onToggle={() => setVisiblePasswords((visible) => ({
                      ...visible,
                      [input.name]: !visible[input.name],
                    }))}
                    inputId={input.name}
                    label={input.label}
                    disabled={pending}
                  />
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-center scale-x-0 bg-[#0284c7] transition-transform duration-300 ease-out group-focus-within:scale-x-100 motion-reduce:transition-none"
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
          {validationErrors !== null && visibleRequirements.length > 0 && (
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
              ].filter((rule) => visibleRequirements.includes(rule.name)).map((rule) => {
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
                      <span className="sr-only">{valid ? "Met: " : "Required: "}</span>
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
              className="col-span-full border-l-2 border-red-600 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
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
        className="relative mt-auto w-full cursor-pointer rounded-r-md bg-[#cef0ff] py-3.5 text-center text-[13px] font-semibold text-[#286780] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#8acbe0] hover:bg-[#b5eaff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#367891] disabled:cursor-wait disabled:opacity-50"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="pt-5 text-center text-xs leading-5 text-[#626a78]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#286780] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
