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
    <CreditCard className="w-6 h-6 text-[#ffffff] fill-[#242424] mr-4 flex-shrink-0" />
  ) : (
    <Lock className="w-6 h-6 text-[#ffffff] fill-[#242424] mr-4 flex-shrink-0" />
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
      label: "National ID (8 digits)",
      autoComplete: "username",
      type: "text",
      minLength: 8,
      maxLength: 8,
      pattern: "[0-9]{8}",
    },
    {
      name: "password",
      label: "********",
      autoComplete: "current-password",
      type: "password",
      minLength: 6,
      maxLength: 12,
    },
  ];

  return (
    <div className="w-full bg-white flex flex-col">
      {/* Upper Content Section */}
      <div className="pt-10 pb-8 px-8 sm:px-12 flex flex-col items-center">
        {/* MHS Icon */}
        <div className="w-24 h-24 rounded-full bg-[#ffffff] flex items-center justify-center mb-8 shadow-inner">
          <Hospital className="size-24 text-[#ffffff] fill-[#142375] flex-shrink-0" />
        </div>

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
          className="w-full flex flex-col gap-6"
        >
          {inputs.map((input) => (
            <div key={input.name}>
              {input.name === "nationalIdentificationNumber" && (
                <p
                  id="national-id-hint"
                  className="mb-2 text-[11px] leading-4 text-[#626a78]"
                >
                  Exactly 8 digits. No spaces, dots or hyphens.
                </p>
              )}
              <div className="relative border-b-2 border-[#242424] pb-2 flex items-center">
                {getIconForField(input.name)}
                <input
                  name={input.name}
                  type={input.type || "text"}
                  placeholder={input.label}
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
                  className="w-full bg-transparent outline-none text-[#242424] placeholder-[#3d3d3d] font-medium tracking-wide disabled:opacity-50 text-sm leading-6"
                />
              </div>
            </div>
          ))}

          {/* Remember Me & Forgot Password Row */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 pt-2 text-[11px] leading-5 text-[#242424]">
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-xs leading-5 select-none">
              <div className="relative flex shrink-0 items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="peer sr-only"
                />
                <div className="size-[18px] border border-black rounded-xs bg-white flex items-center justify-center peer-checked:bg-black peer-checked:[&_svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#142375] transition-colors">
                  <Check
                    aria-hidden="true"
                    className="size-3.5 text-white stroke-[3] opacity-0"
                  />
                </div>
              </div>
              <span className="font-semibold text-[#444444]">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="shrink-0 whitespace-nowrap font-semibold italic text-[#242424] transition-colors hover:text-[#142375]"
            >
              Forgot Password?
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
              className="text-red-600 font-medium mt-2 text-xs leading-5"
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
        className="w-full bg-[#142375] hover:bg-[#152788] text-white py-4 text-center font-bold tracking-[0.25em] uppercase transition-colors duration-200 mt-auto cursor-pointer disabled:opacity-50 text-sm leading-7"
      >
        {pending ? "LOADING..." : "LOGIN"}
      </button>
      <p className="pt-4 text-center text-xs leading-5 text-[#626a78]">
        New patient?{" "}
        <Link href="/register" className="font-bold text-[#142375] underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
