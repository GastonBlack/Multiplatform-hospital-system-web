"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, CreditCard, Check, Hospital, X } from "lucide-react";
import { loginAction } from "../actions";
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

function getIconForField(fieldName: string) {
  return fieldName === "nationalIdentificationNumber" ? (
    <CreditCard aria-hidden="true" strokeWidth={1.6} className="mr-3 size-[18px] shrink-0 text-[#737986]" />
  ) : (
    <Lock aria-hidden="true" strokeWidth={1.6} className="mr-3 size-[18px] shrink-0 text-[#737986]" />
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const [validationErrors, setValidationErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  const inputs: Field[] = [
    {
      name: "nationalIdentificationNumber",
      label: "National ID",
      autoComplete: "username",
      type: "text",
      minLength: 8,
      maxLength: 8,
      pattern: "[0-9]{8}",
    },
    {
      name: "password",
      label: "Password",
      autoComplete: "current-password",
      type: "password",
      minLength: 6,
      maxLength: 12,
    },
  ];

  return (
    <div className="w-full bg-white flex flex-col">
      {/* Upper Content Section */}
      <div className="flex flex-col items-center px-2 pt-7 pb-7 sm:px-8 sm:pt-8">
        {/* MHS Icon */}
        <div className="flex flex-col items-center">
          <Hospital aria-hidden="true" strokeWidth={1.4} className="size-12 shrink-0 fill-none text-[#367891]" />
          <span className="mt-1 text-[11px] font-bold tracking-[0.12em] text-[#367891]">MHS</span>
        </div>
        <h1 className="mt-5 mb-7 text-xl font-medium tracking-[-0.03em]">Sign in</h1>

        {/* Form */}
        <form
          id="login-form"
          action={action}
          noValidate
          onReset={() => setValidationErrors(null)}
          onInput={(event) => {
            const input = event.target;
            if (
              !(input instanceof HTMLInputElement) ||
              (input.name !== "nationalIdentificationNumber" &&
                input.name !== "password")
            )
              return;
            setValidationErrors(
              validateForm(new FormData(event.currentTarget), false).errors,
            );
          }}
          onSubmit={(event) => {
            const { errors } = validateForm(
              new FormData(event.currentTarget),
              false,
            );
            setValidationErrors(errors);
            if (Object.keys(errors).length) event.preventDefault();
          }}
          className="flex w-full flex-col gap-5"
        >
          {inputs.map((input) => (
            <div key={input.name} className="mx-auto w-full sm:w-[85%]">
              <label htmlFor={`login-${input.name}`} className="mb-2 block text-xs font-medium text-[#626a78]">{input.label}</label>
              {input.name === "nationalIdentificationNumber" && (
                <p
                  id="national-id-hint"
                  className="mb-2 text-[11px] leading-4 text-[#626a78]"
                >
                  Exactly 8 digits. No spaces, dots or hyphens.
                </p>
              )}
              <div className="flex items-center border-b border-[#d5e7ee] px-1 py-2 transition-colors focus-within:border-[#79bfd7] focus-within:bg-[#f1faff] hover:bg-[#f8fcfe] motion-reduce:transition-none">
                {getIconForField(input.name)}
                <input
                  id={`login-${input.name}`}
                  name={input.name}
                  type={input.type || "text"}
                  placeholder={input.name === "password" ? "Enter your password" : "Enter your 8-digit ID"}
                  autoComplete={input.autoComplete}
                  minLength={input.minLength}
                  maxLength={input.maxLength}
                  pattern={input.pattern}
                  required
                  aria-label={
                    input.name === "password" ? "Password" : input.label
                  }
                  aria-invalid={
                    validationErrors !== null
                      ? !!validationErrors[input.name]
                      : undefined
                  }
                  aria-describedby={
                    [
                      input.name === "nationalIdentificationNumber"
                        ? "national-id-hint"
                        : "",
                      validationErrors !== null
                        ? `${input.name}-requirement`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  disabled={pending}
                  className="min-w-0 w-full bg-transparent py-1 text-[13px] leading-6 text-[#363636] outline-none focus-visible:shadow-none! disabled:opacity-50"
                />
              </div>
            </div>
          ))}

          {/* Remember Me & Forgot Password Row */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-1 text-xs leading-5 text-[#242424]">
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-xs leading-5 select-none">
              <div className="relative flex shrink-0 items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="peer sr-only"
                />
                <div className="flex size-[18px] items-center justify-center rounded-xs border border-[#737986] bg-white transition-colors peer-checked:border-[#242424] peer-checked:bg-[#242424] peer-checked:[&_svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#142375]">
                  <Check
                    aria-hidden="true"
                    className="size-3.5 text-white stroke-[3] opacity-0"
                  />
                </div>
              </div>
              <span className="font-medium text-[#536078]">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="shrink-0 whitespace-nowrap font-medium text-[#286780] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {validationErrors !== null && (
            <ul
              aria-label="Sign-in requirements"
              aria-live="polite"
              aria-atomic="true"
              className="flex flex-col gap-2 text-xs leading-5"
            >
              {[
                {
                  name: "nationalIdentificationNumber",
                  text: "National ID: exactly 8 digits, without spaces, dots or hyphens.",
                },
                { name: "password", text: "Password: 6 to 12 characters." },
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
                      className="mt-0.5 shrink-0"
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

          {state.message && !state.success && (
            <p
              role="alert"
              className="border-l-2 border-red-600 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
            >
              {state.message}
            </p>
          )}
        </form>
      </div>

      {/* Bottom Action Button */}
      <button
        type="submit"
        form="login-form"
        disabled={pending}
        className="relative mt-auto w-full cursor-pointer rounded-r-md bg-[#eff9fd] py-3.5 text-center text-[13px] font-semibold text-[#286780] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#8acbe0] hover:bg-[#e3f4fb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#367891] disabled:cursor-wait disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="pt-5 text-center text-xs leading-5 text-[#626a78]">
        New patient?{" "}
        <Link href="/register" className="font-medium text-[#286780] underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
