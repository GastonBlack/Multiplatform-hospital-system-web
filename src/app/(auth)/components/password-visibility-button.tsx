"use client";

import { Eye, EyeOff } from "lucide-react";

interface PasswordVisibilityButtonProps {
  visible: boolean;
  onToggle: () => void;
  inputId: string;
  label: string;
  disabled: boolean;
}

export function PasswordVisibilityButton({
  visible,
  onToggle,
  inputId,
  label,
  disabled,
}: PasswordVisibilityButtonProps) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <button
      type="button"
      aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
      aria-pressed={visible}
      aria-controls={inputId}
      disabled={disabled}
      onClick={onToggle}
      className="ml-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded text-[#737986] hover:bg-[#e3f4fb] hover:text-[#286780] focus-visible:outline-2 focus-visible:outline-[#367891] disabled:cursor-default disabled:opacity-50"
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.6} />
    </button>
  );
}
